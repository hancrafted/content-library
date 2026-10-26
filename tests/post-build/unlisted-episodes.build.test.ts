// Unlisted Episodes (design-ADR 0016, Routes and visibility): an Episode made for one Event lives only under that
// Event. It is never in the sitemap, the Episode overview or an Upcoming list, has no /episodes/ page, and its page
// under the Event tells search engines not to index it. The AXEL seminar's Playlist lists three such copies.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { episodeRoute, eventEpisodeRoute, eventRoute, legacyEpisodeRoute, ROUTES } from '../../src/lib/routes';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const AXEL = '2026-10-23-axel-agentic-workflow';
/** The AXEL seminar's unlisted copies, in the order it taught them. Written out: the store is not the oracle. */
const UNLISTED = ['axel-onboard-ai-every-time', 'axel-ai-attention-span', 'axel-ai-gives-you-more-work'] as const;
const PER_LOCALE = UNLISTED.flatMap((episode) => LOCALES.map((locale) => ({ episode, locale })));

/** The Episode slugs a page shows as cards, wherever it shows them. */
function cardSlugs(url: string): string[] {
  const $ = exportedPage(url);
  return $('[data-episode-card]')
    .map((_, card) => $(card).attr('data-episode-slug'))
    .get();
}

describe('unlisted Episodes stay out of every list', () => {
  it('An unlisted Episode never shows in the sitemap, the Episode overview or an Upcoming list.', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    const lists = LOCALES.flatMap((locale) => [localizePath(ROUTES.episodes, locale), localizePath('/', locale)]);
    const expected = { sitemap: [], lists: [] };
    // ACT
    const seen = {
      sitemap: UNLISTED.filter((episode) => sitemap.includes(`/${episode}/`)),
      lists: lists.flatMap((url) =>
        cardSlugs(url)
          .filter((slug) => (UNLISTED as readonly string[]).includes(slug))
          .map((slug) => `${url}: ${slug}`),
      ),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(PER_LOCALE)('exports no /episodes/ page for $episode in $locale', ({ episode, locale }) => {
    // ARRANGE
    const pages = [episodeRoute(episode), legacyEpisodeRoute(episode)].map((route) => localizePath(route, locale));
    // ACT
    const exported = pages.filter((url) => existsSync(join(OUT_DIR, exportedFile(url))));
    // ASSERT
    expect(exported).toEqual([]);
  });
});

describe('unlisted Episode pages under their Event', () => {
  it.each(PER_LOCALE)(
    'An unlisted Episode page tells search engines not to index it. ($episode, $locale)',
    ({ episode, locale }) => {
      // ARRANGE
      const url = localizePath(eventEpisodeRoute(AXEL, episode), locale);
      const expected = { robots: 'noindex', canonical: true };
      const $ = exportedPage(url);
      // ACT
      const seen = {
        robots: $('meta[name="robots"]').attr('content'),
        canonical: ($('link[rel="canonical"]').attr('href') ?? '').endsWith(`${url}/`),
      };
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );

  it.each(LOCALES)('The AXEL Event page lists its three unlisted Episodes in order, under the Event (%s)', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL), locale));
    const expected = UNLISTED.map((episode) => ({
      slug: episode,
      href: `${localizePath(eventEpisodeRoute(AXEL, episode), locale)}/`,
    }));
    // ACT
    const seen = $('ol[data-event-playlist] [data-episode-card]')
      .map((_, card) => ({
        slug: $(card).attr('data-episode-slug'),
        href: $(card).find('a[data-card-link]').attr('href'),
      }))
      .get();
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
