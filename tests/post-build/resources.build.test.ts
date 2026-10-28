// Post-build check of the Templates (design-ADR 0019): four public, indexed pages in both locales, each an Episode-shaped
// page; the overview that lists them and the nav that leads there; no Episode list shows one; the old tooling URLs
// are gone or redirected; `slide-layouts` stays deleted.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { templateRoute, type TemplateSlug } from '../../src/content-store/catalogue/record-routes';
import type { TemplateType } from '../../src/content-store/schemas/fields';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedFile, exportedPage, OUT_DIR, redirectRules, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();

/** The four Resources and their URLs, written out: the handoff's table is the expectation. */
const TEMPLATES: readonly { slug: TemplateSlug; type: TemplateType; path: string }[] = [
  { slug: 'episode-template', type: 'episode-template', path: '/episode-templates/episode-template' },
  { slug: 'workshop-template', type: 'episode-template', path: '/episode-templates/workshop-template' },
  { slug: 'timelines', type: 'master-slide', path: '/master-slides/timelines' },
  { slug: 'grids', type: 'master-slide', path: '/master-slides/grids' },
];

const PAGES = TEMPLATES.flatMap((template) =>
  LOCALES.map((locale) => ({ ...template, locale, url: localizePath(template.path, locale) })),
);

/** Every exported HTML file, relative to `out/`. */
function htmlFiles(dir = OUT_DIR): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [relative(OUT_DIR, path)] : [];
  });
}

describe.each(PAGES)('the Template page $url', ({ type, slug, path, url }) => {
  it('renders its Slides in the Episode container, with a title slide', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const slides = $('[data-slide]').length;
    // ASSERT
    expect($('[data-testid="episode-page"]').length).toBe(1);
    expect(slides).toBeGreaterThan(1);
  });

  it('is indexed and canonical at its own URL', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const robots = $('meta[name="robots"]').attr('content') ?? '';
    const canonical = $('link[rel="canonical"]').attr('href') ?? '';
    // ASSERT
    expect(robots).not.toContain('noindex');
    expect(canonical.endsWith(`${path}/`)).toBe(true);
  });

  it('derives its URL from its type and slug', () => {
    // ARRANGE
    const expected = path;
    // ACT
    const route = templateRoute(type, slug);
    // ASSERT
    expect(route).toBe(expected);
  });
});

const KINDS = ['episode', 'event', 'explorable-page', 'episode-template', 'master-slide'];

describe('the Resources overview', () => {
  it.each(LOCALES)('lists the four Templates, each linking to its page, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.resources, locale));
    const expected = TEMPLATES.map(({ path }) => `${basePath}${localizePath(path, locale)}/`).sort();
    // ACT
    const hrefs = $(
      '[data-resource-card][data-resource-kind$="-template"], [data-resource-card][data-resource-kind="master-slide"]',
    )
      .find('h2 a')
      .toArray()
      .map((link) => $(link).attr('href') ?? '')
      .sort();
    // ASSERT
    expect(hrefs).toEqual(expected);
  });

  it.each(LOCALES)('lists all five kinds, each card linking to a page of its own kind, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.resources, locale));
    const prefix = `${basePath}${localizePath('/', locale)}`.replace(/\/$/, '');
    const pathOf = (kind: string) =>
      ({
        episode: '/episodes/',
        event: '/events/',
        'explorable-page': '/explorables/',
        'episode-template': '/episode-templates/',
        'master-slide': '/master-slides/',
      })[kind] ?? '';
    // ACT
    const cards = $('[data-resource-card]')
      .toArray()
      .map((card) => ({
        kind: $(card).attr('data-resource-kind') ?? '',
        href: $(card).find('h2 a').attr('href') ?? '',
      }));
    const kinds = [...new Set(cards.map(({ kind }) => kind))];
    const misplaced = cards.filter(({ kind, href }) => !href.startsWith(`${prefix}${pathOf(kind)}`));
    // ASSERT
    expect(kinds.sort()).toEqual([...KINDS].sort());
    expect(misplaced).toEqual([]);
  });

  it.each(LOCALES)(
    'offers a search, a kind filter with a chip and count per kind, Tag chips and the view switch, for %s',
    (locale) => {
      // ARRANGE
      const $ = exportedPage(localizePath(ROUTES.resources, locale));
      // ACT
      const search = $('[data-resource-controls] input[type="search"][data-resource-search]').length;
      const chips = $('[data-resource-kind-filter] [data-filter-tag]')
        .toArray()
        .map((chip) => ({
          kind: $(chip).attr('data-filter-tag'),
          count: Number($(chip).find('span').text()),
        }));
      const cardsOf = (kind: string) => $(`[data-resource-card][data-resource-kind="${kind}"]`).length;
      const allChips = $('[data-resource-controls] [data-filter-tag]').length;
      const views = $('[data-resource-view]').length;
      // ASSERT
      expect(search).toBe(1);
      expect(chips.map(({ kind }) => kind)).toEqual(KINDS);
      expect(chips.map(({ count }) => count)).toEqual(KINDS.map(cardsOf));
      expect(allChips).toBeGreaterThan(chips.length);
      expect(views).toBe(2);
    },
  );

  it.each(LOCALES)('is indexed and in the sitemap with the four Template pages, for %s', (locale) => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    const urls = [ROUTES.resources, ...TEMPLATES.map(({ path }) => path)].map(
      (route) => `${localizePath(route, locale)}/`,
    );
    // ACT
    const missing = urls.filter((url) => !sitemap.includes(`${url}</loc>`));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it.each(LOCALES)('is reached by the Resources nav link, between Events and the rest, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.events, locale));
    // ACT
    const links = $('[data-testid="site-nav"] a')
      .toArray()
      .map((link) => $(link).attr('data-testid'));
    // ASSERT
    expect(links.slice(0, 3)).toEqual(['nav-episodes', 'nav-events', 'nav-resources']);
  });
});

describe('Episode lists', () => {
  it.each(LOCALES)('show no Template as an Episode card for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.episodes, locale));
    // ACT
    const cards = $('a[href*="/episodes/"]')
      .toArray()
      .map((link) => $(link).attr('href') ?? '')
      .filter((href) => TEMPLATES.some(({ slug }) => href.includes(`/episodes/${slug}/`)));
    // ASSERT
    expect(cards).toEqual([]);
  });
});

describe('the old tooling URLs', () => {
  const OLD = ['episode-template', 'workshop-template', 'slide-master', 'explorable-explanations', 'slide-layouts'];

  it.each(LOCALES)('are exported no more for %s', (locale) => {
    // ARRANGE
    const files = OLD.map((slug) => join(OUT_DIR, exportedFile(localizePath(`/episodes/${slug}`, locale))));
    // ACT
    const exported = files.filter((file) => existsSync(file));
    // ASSERT
    expect(exported).toEqual([]);
  });

  it.each(LOCALES)('redirect with a 301 to their page or the overview for %s', (locale) => {
    // ARRANGE
    const to = (path: string) => `${localizePath(path, locale)}/`;
    const expected = [
      { from: `${localizePath('/episodes/explorable-explanations', locale)}/*`, to: to('/explorables') },
      { from: `${localizePath('/episodes/slide-master', locale)}/*`, to: to(ROUTES.resources) },
      {
        from: `${localizePath('/episodes/episode-template', locale)}/*`,
        to: to('/episode-templates/episode-template'),
      },
      {
        from: `${localizePath('/episodes/workshop-template', locale)}/*`,
        to: to('/episode-templates/workshop-template'),
      },
    ].map((rule) => ({ ...rule, status: '301' }));
    // ACT
    const rules = redirectRules();
    // ASSERT
    expect(rules).toEqual(expect.arrayContaining(expected));
  });

  it('leave `slide-layouts` linked from no exported page', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const linking = htmlFiles().filter((file) => readFileSync(join(OUT_DIR, file), 'utf8').includes('slide-layouts'));
    // ASSERT
    expect(linking).toEqual(expected);
  });
});
