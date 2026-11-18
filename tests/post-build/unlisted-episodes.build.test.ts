// decision: docs/decision-records/0016-content-data-model.md
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeRef, type EpisodeRef } from '../../src/content-store/catalogue/episode-id.pure';
import {
  episodeRoute,
  eventEpisodeRoute,
  eventRoute,
  legacyEpisodeRoute,
  type EventSlug,
} from '../../src/content-store/catalogue/record-routes';
import { listEpisodes, listEvents } from '../../src/content-store/store';
import summaries from '../../src/episodes/lib/page-summaries.generated.json' with { type: 'json' };
import { LOCALES, localizePath, type Locale } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const AXEL = '2026-10-23-axel-agentic-workflow' satisfies EventSlug;
// decision: ARCH-003 §1.2
const AXEL_UNLISTED_SLUGS = ['onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'] as const;
const AXEL_UNLISTED = AXEL_UNLISTED_SLUGS.map((slug) => episodeRef(slug, AXEL));
const PRESENTED = listEvents().flatMap((event) =>
  event.playlist.episodes
    .flatMap(({ episode, page }) => (episode.visibility === 'unlisted' && page !== undefined ? [page] : []))
    .map((episode) => ({ event: event.slug, episode })),
);
const UNLISTED_URLS: readonly string[] = PRESENTED.flatMap(({ event, episode }) =>
  LOCALES.map((locale) => `${localizePath(eventEpisodeRoute(event, episode), locale)}/`),
);
const PER_LOCALE = PRESENTED.flatMap((presented) => LOCALES.map((locale) => ({ ...presented, locale })));

function cardLinks(url: string): string[] {
  const $ = exportedPage(url);
  return $('[data-episode-card] a[data-card-link]')
    .map((_, link) => $(link).attr('href'))
    .get();
}

describe('unlisted Episodes stay out of every list', () => {
  it('An unlisted Episode never shows in the sitemap, the Episode browser or an Upcoming list.', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    const lists = LOCALES.flatMap((locale) => [localizePath(ROUTES.episodes, locale), localizePath('/', locale)]);
    const expected = { sitemap: [], lists: [] };
    // ACT
    const seen = {
      sitemap: UNLISTED_URLS.filter((url) => sitemap.includes(url)),
      lists: lists.flatMap((url) =>
        cardLinks(url)
          .filter((href) => UNLISTED_URLS.includes(href))
          .map((href) => `${url}: ${href}`),
      ),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(PER_LOCALE)('exports no /episodes/ page for $episode.id in $locale', ({ episode, locale }) => {
    // ARRANGE
    const pages = [episodeRoute(episode.id), legacyEpisodeRoute(episode.id)].map((route) =>
      localizePath(route, locale),
    );
    // ACT
    const exported = pages.filter((url) => existsSync(join(OUT_DIR, exportedFile(url))));
    // ASSERT
    expect(exported).toEqual([]);
  });
});

describe('unlisted Episode pages under their Event', () => {
  it.each(PER_LOCALE)(
    'An unlisted Episode page tells search engines not to index it. ($episode.id, $locale)',
    ({ event, episode, locale }) => {
      // ARRANGE
      const url = localizePath(eventEpisodeRoute(event, episode), locale);
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
    const expected = AXEL_UNLISTED.map((episode, index) => ({
      slug: AXEL_UNLISTED_SLUGS[index],
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

// decision: ARCH-003 §1.2
const RECORDED_IN: Record<Locale, Record<Locale, string>> = {
  en: { en: 'Recorded in English', de: 'Recorded in German' },
  de: { en: 'Aufgezeichnet auf Englisch', de: 'Aufgezeichnet auf Deutsch' },
};

function recordingOf(episode: EpisodeRef): { id: string; language: Locale } | undefined {
  const video = listEpisodes().find(({ ref }) => ref.id === episode.id)?.youtube;
  return video !== undefined && 'language' in video ? { id: video.id, language: video.language as Locale } : undefined;
}

function episodeTitle(episode: EpisodeRef, locale: Locale): string {
  return (summaries.episodes as Record<string, Record<Locale, { title: string }>>)[episode.id][locale].title;
}

describe('an unlisted Episode plays its Event recording', () => {
  it.each(PER_LOCALE)(
    'An unlisted Episode plays its event recording, labelled with its title and the language it was recorded in. ($episode.id, $locale)',
    ({ event, episode, locale }) => {
      // ARRANGE
      const $ = exportedPage(localizePath(eventEpisodeRoute(event, episode), locale));
      const recording = recordingOf(episode);
      const title = episodeTitle(episode, locale);
      const expected =
        recording === undefined
          ? { video: undefined, language: undefined, label: '', title: '' }
          : {
              video: recording.id,
              language: recording.language,
              label: RECORDED_IN[locale][recording.language],
              title,
            };
      // ACT
      const launcher = $('[data-slot="title-slide"] #talk-launcher');
      const label = launcher.find('[data-recording-language]');
      const seen = {
        video: launcher.attr('data-video-id'),
        language: label.attr('data-recording-language'),
        label: label.text(),
        title: launcher.find('[data-talk-title]').text(),
      };
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );
});
