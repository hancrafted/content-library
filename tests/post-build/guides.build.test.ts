// Post-build check of the Guides (design-ADR 0019 as amended by #450): the overview at /guides/ in both locales,
// indexed, in the sitemap and reached from the Learn group; every Guide the catalogue builds is an Episode-shaped page
// at /guides/<slug>/, indexed and canonical at its own URL, and listed on the overview.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routeOf } from '../../src/content-store/catalogue/record-routes';
import { PAGES } from '../../src/content-store/store';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage, OUT_DIR, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();
const GUIDE_VIDEO_ID = '8BTzjMUCgpc';
const GUIDE_TITLES = {
  en: 'Get workshop-ready: your AI agent on your laptop',
  de: 'Bereit für den Workshop: Dein KI-Agent auf Deinem Laptop',
} as const;
const GUIDE_ROUTE = '/guides/setup-ai-agent-and-starter-folder';
const CARD_ACTIONS = {
  en: { open: 'Open Guide', video: 'Watch on YouTube', newTab: 'opens in a new tab' },
  de: { open: 'Anleitung öffnen', video: 'Auf YouTube ansehen', newTab: 'öffnet in einem neuen Tab' },
} as const;

/** Every public Guide the catalogue lists, by route. */
const LISTED_GUIDES = PAGES.filter(({ page, treatment }) => page.kind === 'guide' && treatment.listed).map(({ page }) =>
  routeOf(page),
);

describe.each(LOCALES)('the Guides overview in %s', (locale) => {
  const url = localizePath(ROUTES.guides, locale);

  it('renders text-only reading cards with decorative localized Open Guide cues and no invented date', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const expected = { ...CARD_ACTIONS[locale], position: 'none', hidden: 'true', cards: LISTED_GUIDES.length };
    // ACT
    const cards = $('[data-guide-card]');
    const cues = cards.find('[data-ink-primary]');
    const positions = cards.toArray().map((card) => $(card).attr('data-card-visual-position'));
    // ASSERT
    expect(positions).toEqual(Array(expected.cards).fill(expected.position));
    expect(cards.find('[data-card-body]').length).toBe(expected.cards);
    expect(cards.find('[data-card-visual], [data-card-media], time, .bg-linear-to-br').length).toBe(0);
    expect(cues.toArray().map((cue) => $(cue).text().trim())).toEqual(Array(expected.cards).fill(expected.open));
    expect(cues.toArray().map((cue) => $(cue).attr('aria-hidden'))).toEqual(
      Array(expected.cards).fill(expected.hidden),
    );
    expect(cues.filter('a, button, [tabindex]').length).toBe(0);
    expect(cards.find('h2 a[data-card-link]').length).toBe(expected.cards);
  });

  it('is indexed, canonical at its own URL and in the sitemap', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    // ACT
    const robots = $('meta[name="robots"]').attr('content') ?? '';
    const canonical = $('link[rel="canonical"]').attr('href') ?? '';
    // ASSERT
    expect($('[data-testid="guides-index-page"]').length).toBe(1);
    expect(robots).not.toContain('noindex');
    expect(canonical.endsWith(`${url}/`)).toBe(true);
    expect(sitemap).toContain(`${url}/</loc>`);
  });

  it('links every listed Guide, and each Guide renders in the Episode container, indexed', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const expected = LISTED_GUIDES.map((route) => `${basePath}${localizePath(route, locale)}/`).sort();
    // ACT
    const hrefs = $('[data-guide-card] h2 a')
      .toArray()
      .map((link) => $(link).attr('href') ?? '')
      .sort();
    const broken = LISTED_GUIDES.filter((route) => {
      const page = exportedPage(localizePath(route, locale));
      const robots = page('meta[name="robots"]').attr('content') ?? '';
      return page('[data-testid="episode-page"]').length !== 1 || robots.includes('noindex');
    });
    // ASSERT
    expect(hrefs).toEqual(expected);
    expect(broken).toEqual([]);
  });

  it('plays the Guide video and links to it from the card', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const guide = exportedPage(localizePath(GUIDE_ROUTE, locale));
    const expectedVideoUrl = `https://www.youtube.com/watch?v=${GUIDE_VIDEO_ID}`;
    const expectedTalkTitle = GUIDE_TITLES[locale];
    const expectedActions = CARD_ACTIONS[locale];
    // ACT
    const launcher = guide('[data-slot="title-slide"] [data-video-id]');
    const videoLink = $(`[data-guide-card="setup-ai-agent-and-starter-folder"] [data-guide-video]`);
    // ASSERT
    expect(launcher.attr('data-video-id')).toBe(GUIDE_VIDEO_ID);
    expect(launcher.find('[data-talk-title]').text().trim()).toBe(expectedTalkTitle);
    expect(videoLink.attr('href')).toBe(expectedVideoUrl);
    expect(videoLink.attr('target')).toBe('_blank');
    expect(videoLink.attr('rel')).toBe('noopener noreferrer');
    expect(videoLink.attr('data-ink-secondary')).toBe('');
    expect(videoLink.find('[data-ink-label]').text().trim()).toBe(expectedActions.video);
    expect(videoLink.text()).toContain(expectedActions.newTab);
  });
});
