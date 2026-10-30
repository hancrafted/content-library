// Post-build check of the header's navigation (spec #404): Explorables, Events, Learn (Episodes, Guides, Resources), then the
// Dashboard in English only; one copy of every link; Learn as a menu trigger with no page of its own; the active
// state on an Episode, a Resource and an Explorable page.

import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath, type Locale } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage } from './exported-pages';

const LABELS: Record<
  Locale,
  { explorables: string; events: string; learn: string; episodes: string; guides: string; resources: string }
> = {
  en: {
    explorables: 'Explorables',
    events: 'Events',
    learn: 'Learn',
    episodes: 'Episodes',
    guides: 'Guides',
    resources: 'Resources',
  },
  de: {
    explorables: 'Explorables',
    events: 'Veranstaltungen',
    learn: 'Lernen',
    episodes: 'Episoden',
    guides: 'Anleitungen',
    resources: 'Ressourcen',
  },
};

/** The header nav of an exported page, as its links' test ids in document order and the active test ids. */
function nav(url: string) {
  const $ = exportedPage(url);
  const scope = $('[data-testid="site-nav"]');
  const text = (id: string) => scope.find(`[data-testid="${id}"]`).first().text().trim();
  const activeLinks = scope
    .find('a[aria-current="page"]')
    .toArray()
    .map((a) => $(a).attr('data-testid'));
  return {
    $,
    scope,
    text,
    activeLinks,
    learnActive: scope.find('[data-testid="nav-learn"] button').attr('data-active'),
  };
}

describe.each(LOCALES)('the header nav in %s', (locale) => {
  const labels = LABELS[locale];
  const home = localizePath('/', locale);

  it('reads Explorables, Events, then Learn, with the Dashboard last in English only', () => {
    // ARRANGE
    const { $, scope } = nav(home);
    // ACT
    const order = scope
      .find('[data-testid^="nav-"]:not([data-testid="nav-learn-label"])')
      .toArray()
      .map((el) => $(el).attr('data-testid'));
    // ASSERT
    const dashboard = locale === 'en' ? ['nav-dashboard'] : [];
    expect(order).toEqual([
      'nav-explorables',
      'nav-events',
      'nav-learn',
      'nav-episodes',
      'nav-guides',
      'nav-resources',
      ...dashboard,
    ]);
  });

  it('labels its items in the locale and holds Episodes and Resources in the Learn group', () => {
    // ARRANGE
    const { scope, text } = nav(home);
    // ACT
    const group = scope.find('[data-testid="nav-learn"]');
    // ASSERT
    expect(text('nav-explorables')).toBe(labels.explorables);
    expect(text('nav-events')).toBe(labels.events);
    expect(group.find('button').text().trim()).toBe(labels.learn);
    expect(group.find('[data-testid="nav-episodes"]').text().trim()).toBe(labels.episodes);
    expect(group.find('[data-testid="nav-guides"]').text().trim()).toBe(labels.guides);
    expect(group.find('[data-testid="nav-resources"]').text().trim()).toBe(labels.resources);
  });

  it('links Episodes and Resources as links and gives Learn no page', () => {
    // ARRANGE
    const { $, scope } = nav(home);
    // ACT
    const hrefs = ['nav-episodes', 'nav-guides', 'nav-resources'].map((id) =>
      scope.find(`a[data-testid="${id}"]`).attr('href'),
    );
    // ASSERT
    expect(hrefs).toEqual(
      [ROUTES.episodes, ROUTES.guides, ROUTES.resources].map((route) => `${localizePath(route, locale)}/`),
    );
    expect(scope.find('[data-testid="nav-learn"] button').attr('aria-expanded')).toBe('false');
    expect($('a[href*="/learn"]').length).toBe(0);
  });

  it.each([
    { where: 'an Episode', path: '/episodes/ai-attention-span', learn: true, active: ['nav-episodes'] },
    { where: 'the Guides overview', path: ROUTES.guides, learn: true, active: ['nav-guides'] },
    { where: 'the Resources overview', path: ROUTES.resources, learn: true, active: ['nav-resources'] },
    { where: 'a Resource', path: '/episode-templates/episode-template', learn: true, active: ['nav-resources'] },
    { where: 'an Explorable page', path: '/explorables/context-window', learn: false, active: ['nav-explorables'] },
    { where: 'an Event', path: ROUTES.events, learn: false, active: ['nav-events'] },
  ])('marks the active item on $where', ({ path, learn, active }) => {
    // ARRANGE
    const { activeLinks, learnActive } = nav(localizePath(path, locale));
    // ACT
    const expectedLearn = String(learn);
    // ASSERT
    expect(activeLinks).toEqual(active);
    expect(learnActive).toBe(expectedLearn);
  });
});
