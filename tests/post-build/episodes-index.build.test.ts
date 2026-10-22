// Post-build check for Issue #85:
// 1. /episodes index page: lists browse grid, in production build leaves out in-progress drafts.
// 2. /episode/<slug> legacy stubs: forward with <meta http-equiv="refresh"> and declare canonical pointing to /episodes/<slug>.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { EPISODE_SLUGS, episodeRoute, legacyEpisodeRoute, ROUTES } from '../../src/lib/routes';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const SITE_URL = resolveSiteUrl(process.env);
const PUBLISHED_SLUGS = [
  'maintaining-markdown-for-ai',
  'ai-token-economy',
  'never-too-early-sales',
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
];
const DRAFT_SLUGS: readonly string[] = [];
const TAGGED = { slug: 'ai-token-economy', tags: ['cost', 'agentic-ai'] };

describe('/episodes index page', () => {
  it.each(LOCALES)('renders the browse grid on the /episodes page for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);

    // ACT
    const browse = $('[data-episode-browse]');
    const cards = $('[data-episode-browse] [data-episode-card]');
    const cardSlugs = cards.toArray().map((card) => $(card).attr('data-episode-slug'));

    // ASSERT
    expect(browse.length).toBe(1);
    // In production build, only published episodes appear in the browse grid
    for (const slug of PUBLISHED_SLUGS) {
      expect(cardSlugs).toContain(slug);
    }
    for (const slug of DRAFT_SLUGS) {
      expect(cardSlugs).not.toContain(slug);
    }
  });

  it('dates every published card in the /episodes browse grid with its release day', () => {
    // ARRANGE
    const $ = exportedPage(ROUTES.episodes);
    const expected = { slug: 'onboard-ai-every-time', dateTime: '2026-10-20', text: 'Oct 20, 2026' };
    // ACT
    const cards = $('[data-episode-browse] [data-episode-card][data-episode-status="published"]');
    const undated = cards.filter((_, card) => $(card).find('time[data-episode-date]').length === 0);
    const date = $(`[data-episode-browse] [data-episode-slug="${expected.slug}"] time[data-episode-date]`);
    // ASSERT
    expect(undated.length).toBe(0);
    expect({ slug: expected.slug, dateTime: date.attr('datetime'), text: date.text() }).toEqual(expected);
  });

  it.each(LOCALES)('offers tag filter chips on the /episodes page for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);

    // ACT
    const chips = $('[data-browse-controls] button[aria-pressed]');
    const pressed = chips.filter('[aria-pressed="true"]');

    // ASSERT
    expect(chips.length).toBeGreaterThan(pressed.length);
    expect(pressed.length).toBe(1);
    expect(chips.first().attr('aria-pressed')).toBe('true');
  });

  it.each(LOCALES)('shows no Format control and no Topic on the /episodes page for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);
    const absent =
      '[aria-label="Filter by format"], [aria-label="Nach Format filtern"], [data-topic], [data-highlight-label]';
    const expected = 0;

    // ACT
    const found = $(absent);

    // ASSERT
    expect(found.length).toBe(expected);
  });

  it.each(LOCALES)('puts one search box above the filters on the /episodes page for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);
    const expected = 1;

    // ACT
    const search = $('[data-browse-controls] input[type="search"][data-episode-search]');

    // ASSERT
    expect(search.length).toBe(expected);
  });

  it.each(LOCALES)('links each card with a video to it in a new tab on the /episodes page for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);
    const withVideo = ['maintaining-markdown-for-ai', 'ai-token-economy', 'never-too-early-sales'];

    // ACT
    const linked = $('[data-episode-card]:has([data-episode-video])')
      .toArray()
      .map((card) => $(card).attr('data-episode-slug'));
    const unsafe = $('[data-episode-video]:not([target="_blank"][rel="noopener noreferrer"])');

    // ASSERT
    expect(linked.sort()).toEqual([...withVideo].sort());
    expect(unsafe.length).toBe(0);
  });

  it.each(LOCALES)('draws every linked card on the /episodes page with the hover arrow for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);
    const expected = PUBLISHED_SLUGS.length;

    // ACT
    const linked = $(
      '[data-episode-browse] [data-episode-card][data-card-variant="compact"]:not([data-episode-status="upcoming"])',
    );
    const arrows = linked.find('[data-open-cue="arrow"]');

    // ASSERT
    expect(linked.length).toBe(expected);
    expect(arrows.length).toBe(expected);
  });

  it.each(LOCALES)('shows each Tag on its card with a tooltip on the /episodes page for %s', (locale) => {
    // ARRANGE
    const url = localizePath(ROUTES.episodes, locale);
    const $ = exportedPage(url);

    // ACT
    const tags = $(`[data-episode-card][data-episode-slug="${TAGGED.slug}"] [data-tag]`);
    const ids = tags.toArray().map((tag) => $(tag).attr('data-tag'));
    const untitled = tags.toArray().filter((tag) => !$(tag).attr('title'));

    // ASSERT
    expect(ids).toEqual(TAGGED.tags);
    expect(untitled).toEqual([]);
  });
});

describe('legacy /episode/<slug> stubs', () => {
  const STUB_PAGES = EPISODE_SLUGS.flatMap((slug) =>
    LOCALES.map((locale) => ({ slug, locale, legacyUrl: localizePath(legacyEpisodeRoute(slug), locale) })),
  );

  it.each(STUB_PAGES)('exports static stub file for $legacyUrl', ({ legacyUrl }) => {
    // ARRANGE & ACT
    const file = join(OUT_DIR, exportedFile(legacyUrl));

    // ASSERT
    expect(existsSync(file)).toBe(true);
  });

  it.each(STUB_PAGES)(
    'forwards with meta refresh and declares canonical to new URL for $legacyUrl',
    ({ slug, locale, legacyUrl }) => {
      // ARRANGE
      const $ = exportedPage(legacyUrl);
      const expectedTarget = localizePath(episodeRoute(slug), locale);
      const expectedCanonical = `${SITE_URL}${expectedTarget}/`;

      // ACT
      const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
      const canonical = $('link[rel="canonical"]').attr('href');
      const fallbackLink = $('[data-testid="episode-stub-page"] a').attr('href');

      // ASSERT
      expect(metaRefresh).toBe(`0; url=${expectedTarget}`);
      expect(canonical).toBe(expectedCanonical);
      expect(fallbackLink).toBe(expectedTarget);
    },
  );
});
