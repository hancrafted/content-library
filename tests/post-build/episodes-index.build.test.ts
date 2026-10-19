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
const PUBLISHED_SLUGS = ['maintaining-markdown-for-ai', 'ai-token-economy'];
const DRAFT_SLUGS = ['never-too-early-sales-run-3'];

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

  it.each(LOCALES)('offers topic filter chips on the /episodes page for %s', (locale) => {
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
