import type { PageRef } from '@/lib/routes';
import { TOOLING_SLUGS } from '@/lib/tooling-pages';
import { describe, expect, it } from 'vitest';
import { catalogueOf } from './page-catalogue';
import { loadContent } from './store';

/*
 * The page catalogue (GLOSSARY): every page the site has, each with its treatment, and the static params the routes
 * export. Each test hands it records through the store's own load, as the store does with the record files, and asks
 * it what callers ask. Slugs are registered ones: only a registered Episode has a page.
 */

const PUBLIC = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['workflow'],
  publishedOn: '2026-10-20',
} as const;
const UNLISTED = { ...PUBLIC, slug: 'axel-onboard-ai-every-time', visibility: 'unlisted' } as const;
/** An Episode announced before its folder holds a page: its slug is no registered Episode yet. */
const UPCOMING = {
  slug: 'specs-an-agent-can-follow',
  status: 'upcoming',
  visibility: 'public',
  format: 'foundations',
  tags: ['workflow'],
} as const;
const AXEL = '2026-10-23-axel-agentic-workflow';
const CYBERFORUM = '2026-10-28-cyberforum-akademie-intro-agentic-workflow';
const PLAYLIST = { id: 'axel', visibility: 'public', episodes: [PUBLIC.slug, UNLISTED.slug] } as const;
const EVENT = { slug: AXEL, date: '2026-10-23', kind: 'workshop', audience: 'organization', playlist: 'axel' } as const;
const RECORDS = { episodes: [PUBLIC, UNLISTED], events: [EVENT], playlists: [PLAYLIST] };

const LISTED = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' } as const;
const HIDDEN = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' } as const;
const ABSENT = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' } as const;

describe('success cases', () => {
  it('I flip an Episode from unlisted to public by changing one field.', () => {
    // ARRANGE
    const flipped = { ...RECORDS, episodes: [PUBLIC, { ...UNLISTED, visibility: 'public' }] };
    const own: PageRef = { kind: 'episode', episode: UNLISTED.slug };
    const underEvent: PageRef = { kind: 'event-episode', event: AXEL, episode: UNLISTED.slug };
    const seenIn = (input: Parameters<typeof loadContent>[0]) => {
      const catalogue = catalogueOf(loadContent(input));
      return {
        own: catalogue.treatmentOf(own),
        underEvent: catalogue.treatmentOf(underEvent),
        overview: catalogue.listedEpisodes().map((episode) => episode.slug),
        episodesPages: catalogue.episodesPathParams().map(({ episode }) => episode),
      };
    };
    const expected = {
      unlisted: {
        own: ABSENT,
        underEvent: HIDDEN,
        overview: [PUBLIC.slug],
        episodesPages: [PUBLIC.slug, ...TOOLING_SLUGS],
      },
      public: {
        own: LISTED,
        underEvent: { ...HIDDEN, index: true, canonical: { episode: UNLISTED.slug } },
        overview: [PUBLIC.slug, UNLISTED.slug],
        episodesPages: [PUBLIC.slug, UNLISTED.slug, ...TOOLING_SLUGS],
      },
    };
    // ACT
    const seen = { unlisted: seenIn(RECORDS), public: seenIn(flipped) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lists on /events/ only the Events whose Playlist is public, leaving out one whose Playlist is unlisted', () => {
    // ARRANGE
    const hidden = { ...EVENT, slug: CYBERFORUM, date: '2026-10-28', playlist: 'private' };
    const unlistedPlaylist = { ...PLAYLIST, id: 'private', visibility: 'unlisted' };
    const records = { ...RECORDS, events: [EVENT, hidden], playlists: [PLAYLIST, unlistedPlaylist] };
    const expected = { listed: [AXEL], built: [AXEL, CYBERFORUM], hidden: HIDDEN };
    // ACT
    const catalogue = catalogueOf(loadContent(records));
    const seen = {
      listed: catalogue.listedEvents().map((event) => event.slug),
      built: catalogue.eventParams().map(({ event }) => event),
      hidden: catalogue.treatmentOf({ kind: 'event', event: CYBERFORUM }),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('builds a page under the Event for every Episode its Playlist presents', () => {
    // ARRANGE
    const expected = [
      { event: AXEL, episode: PUBLIC.slug },
      { event: AXEL, episode: UNLISTED.slug },
    ];
    // ACT
    const params = catalogueOf(loadContent(RECORDS)).eventEpisodeParams();
    // ASSERT
    expect(params).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never builds, lists or indexes a page whose record the store does not hold', () => {
    // ARRANGE
    const pages: PageRef[] = [
      { kind: 'episode', episode: 'ai-token-economy' },
      { kind: 'event', event: CYBERFORUM },
      { kind: 'event-episode', event: AXEL, episode: 'ai-token-economy' },
    ];
    const expected = [
      { index: false, listed: false, inSitemap: false },
      { index: false, listed: false, inSitemap: false },
      { index: false, listed: false, inSitemap: false },
    ];
    // ACT
    const catalogue = catalogueOf(loadContent(RECORDS));
    const seen = pages.map((page) => {
      const { index, listed, inSitemap } = catalogue.treatmentOf(page);
      return { index, listed, inSitemap };
    });
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lists every page once: the site lists, each Episode, each tooling page, each Event, then each Episode under it', () => {
    // ARRANGE
    const expected: PageRef[] = [
      { kind: 'home' },
      { kind: 'dashboard' },
      { kind: 'episodes' },
      { kind: 'events' },
      { kind: 'episode', episode: PUBLIC.slug },
      { kind: 'episode', episode: UNLISTED.slug },
      ...TOOLING_SLUGS.map((tooling) => ({ kind: 'tooling', tooling }) as const),
      { kind: 'event', event: AXEL },
      { kind: 'event-episode', event: AXEL, episode: PUBLIC.slug },
      { kind: 'event-episode', event: AXEL, episode: UNLISTED.slug },
    ];
    // ACT
    const pages = catalogueOf(loadContent(RECORDS)).pages.map(({ page }) => page);
    // ASSERT
    expect(pages).toEqual(expected);
  });

  it('announces a public upcoming Episode on the overview before its folder holds a page', () => {
    // ARRANGE
    const records = { ...RECORDS, episodes: [PUBLIC, UNLISTED, UPCOMING] };
    const expected = { overview: [PUBLIC.slug, UPCOMING.slug], pages: [PUBLIC.slug, UNLISTED.slug] };
    // ACT
    const catalogue = catalogueOf(loadContent(records));
    const seen = {
      overview: catalogue.listedEpisodes().map((episode) => episode.slug),
      pages: catalogue.pages.flatMap(({ page }) => (page.kind === 'episode' ? [page.episode] : [])),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
