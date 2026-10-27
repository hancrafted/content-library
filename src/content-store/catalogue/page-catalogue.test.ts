import { TOOLING_SLUGS, type PageRef } from '@/content-store/catalogue/record-routes';
import { describe, expect, it } from 'vitest';
import { loadContent } from '../store';
import { episodeRef, toolingRef } from './episode-id.pure';
import { catalogueOf, episodesPathParamsOf, eventEpisodeParamsOf } from './page-catalogue';

/*
 * The page catalogue (GLOSSARY): every page the site has, each with its treatment, the static params the routes
 * export, and the page a route's params name. Each test hands it records through the store's own load, as the store
 * does with the record files, and asks it what callers ask. Slugs are registered ones: only a registered Episode has a
 * page.
 */

const PUBLIC = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['workflow'],
  publishedOn: '2026-10-20',
} as const;
/** The AXEL seminar's unlisted copy of ai-attention-span, in its Event's folder `by-event/<event>/ai-attention-span/`. */
const UNLISTED = { ...PUBLIC, slug: 'ai-attention-span', visibility: 'unlisted' } as const;
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
/** The pages' EpisodeRefs: the public Episode no Event owns, and the AXEL seminar's copy. */
const PUBLIC_REF = episodeRef(PUBLIC.slug);
const COPY = episodeRef(UNLISTED.slug, AXEL);
const PLAYLIST = { id: 'axel', visibility: 'public', episodes: [PUBLIC.slug, COPY.id] } as const;
const EVENT = {
  slug: AXEL,
  date: '2026-10-23',
  kind: 'workshop',
  organizer: 'axel',
  audience: 'organization',
  tags: ['agentic-ai'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'axel',
} as const;
/** The records as the generated registry hands them in, each Episode under the id its folder gives it. */
const own = (record: { readonly slug: string }) => ({ id: record.slug, record });
const copy = (record: object) => ({ id: COPY.id, record });
const RECORDS = { episodes: [own(PUBLIC), copy(UNLISTED)], events: [EVENT], playlists: [PLAYLIST] };

const HIDDEN = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' } as const;
const ABSENT = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' } as const;
const SELF_INDEXED = { exported: true, inSitemap: true, index: true, listed: false, canonical: 'self' } as const;

describe('success cases', () => {
  it("I flip an Event's copy from unlisted to public by changing one field: it is published at its Event URL only.", () => {
    // ARRANGE
    const flipped = { ...RECORDS, episodes: [own(PUBLIC), copy({ ...UNLISTED, visibility: 'public' })] };
    // @ts-expect-error -- an Event's copy has no page of its own under /episodes/; the predicate still fails closed
    const ownPage: PageRef = { kind: 'episode', episode: COPY };
    const underEvent: PageRef = { kind: 'event-episode', event: AXEL, episode: COPY };
    const seenIn = (input: Parameters<typeof loadContent>[0]) => {
      const catalogue = catalogueOf(loadContent(input));
      return {
        own: catalogue.treatmentOf(ownPage),
        underEvent: catalogue.treatmentOf(underEvent),
        overview: catalogue.listedEpisodes().map(({ ref }) => ref.id),
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
        own: ABSENT,
        underEvent: SELF_INDEXED,
        overview: [PUBLIC.slug],
        episodesPages: [PUBLIC.slug, ...TOOLING_SLUGS],
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
    const unlistedPlaylist = { ...PLAYLIST, id: 'private', visibility: 'unlisted', episodes: [PUBLIC.slug] };
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

  it("builds a page under the Event for every Episode its Playlist presents, an Event's copy at its own slug", () => {
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

  it('resolves each page built under /episodes/ from its params, and gives back the same params', () => {
    // ARRANGE
    const expected = [
      { kind: 'episode', episode: PUBLIC_REF },
      ...TOOLING_SLUGS.map((slug) => ({ kind: 'tooling', tooling: toolingRef(slug) })),
    ];
    const catalogue = catalogueOf(loadContent(RECORDS));
    const params = catalogue.episodesPathParams();
    // ACT
    const pages = params.map((param) => catalogue.episodesPathPageAt(param));
    // ASSERT
    expect(pages).toEqual(expected);
    expect(pages.map((page) => page && episodesPathParamsOf(page))).toEqual(params);
  });

  it('resolves each page built under an Event from its params, with the Episode it presents, and gives back the same params', () => {
    // ARRANGE
    const presented = (episode: typeof PUBLIC_REF | typeof COPY, place: object) => ({ event: AXEL, episode, place });
    const expected = [
      {
        kind: 'event-episode',
        event: AXEL,
        episode: PUBLIC_REF,
        presented: presented(PUBLIC_REF, { position: 1, count: 2, next: COPY }),
      },
      {
        kind: 'event-episode',
        event: AXEL,
        episode: COPY,
        presented: presented(COPY, { position: 2, count: 2, previous: PUBLIC_REF }),
      },
    ];
    const catalogue = catalogueOf(loadContent(RECORDS));
    const params = catalogue.eventEpisodeParams();
    // ACT
    const pages = params.map((param) => catalogue.eventEpisodePageAt(param));
    // ASSERT
    const seen = pages.map(
      (page) => page && { ...page, presented: { ...page.presented, event: page.presented.event.slug } },
    );
    expect(seen).toEqual(expected);
    expect(pages.map((page) => page && eventEpisodeParamsOf(page))).toEqual(params);
  });
});

describe('failure cases', () => {
  it('never builds, lists or indexes a page whose record the store does not hold', () => {
    // ARRANGE
    const pages: PageRef[] = [
      { kind: 'episode', episode: episodeRef('ai-token-economy') },
      { kind: 'event', event: CYBERFORUM },
      { kind: 'event-episode', event: AXEL, episode: episodeRef('ai-token-economy') },
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

  it("resolves no page under /episodes/ for an Event's copy, which is never exported there, or a slug the records hold no page for", () => {
    // ARRANGE
    // @ts-expect-error -- an Event's copy has no page of its own under /episodes/; the predicate still fails closed
    const unexported: PageRef = { kind: 'episode', episode: COPY };
    const params = [COPY.id, UNLISTED.slug, 'ai-token-economy', 'no-such-episode'].map((episode) => ({ episode }));
    // ACT
    const catalogue = catalogueOf(loadContent(RECORDS));
    const pages = params.map((param) => catalogue.episodesPathPageAt(param));
    // ASSERT
    expect(catalogue.treatmentOf(unexported).exported).toBe(false);
    expect(pages).toEqual([undefined, undefined, undefined, undefined]);
  });

  it('resolves no page under an Event for an Episode its Playlist does not hold, or an Event the records do not hold', () => {
    // ARRANGE
    const params = [
      { event: AXEL, episode: 'ai-token-economy' },
      { event: AXEL, episode: COPY.id },
      { event: CYBERFORUM, episode: PUBLIC.slug },
      { event: 'no-such-event', episode: PUBLIC.slug },
    ];
    // ACT
    const catalogue = catalogueOf(loadContent(RECORDS));
    const pages = params.map((param) => catalogue.eventEpisodePageAt(param));
    // ASSERT
    expect(pages).toEqual([undefined, undefined, undefined, undefined]);
  });
});

describe('edge cases', () => {
  it("lists every page once: the site lists, each Episode but an Event's copy, each tooling page, each Event, then each Episode under it", () => {
    // ARRANGE
    const expected: PageRef[] = [
      { kind: 'home' },
      { kind: 'dashboard' },
      { kind: 'episodes' },
      { kind: 'events' },
      { kind: 'episode', episode: PUBLIC_REF },
      ...TOOLING_SLUGS.map((slug) => ({ kind: 'tooling', tooling: toolingRef(slug) }) as const),
      { kind: 'event', event: AXEL },
      { kind: 'event-episode', event: AXEL, episode: PUBLIC_REF },
      { kind: 'event-episode', event: AXEL, episode: COPY },
    ];
    // ACT
    const pages = catalogueOf(loadContent(RECORDS)).pages.map(({ page }) => page);
    // ASSERT
    expect(pages).toEqual(expected);
  });

  it('announces a public upcoming Episode on the overview before its folder holds a page', () => {
    // ARRANGE
    const records = { ...RECORDS, episodes: [own(PUBLIC), copy(UNLISTED), own(UPCOMING)] };
    const expected = { overview: [PUBLIC.slug, UPCOMING.slug], pages: [PUBLIC_REF] };
    // ACT
    const catalogue = catalogueOf(loadContent(records));
    const seen = {
      overview: catalogue.listedEpisodes().map(({ ref }) => ref.id),
      pages: catalogue.pages.flatMap(({ page }) => (page.kind === 'episode' ? [page.episode] : [])),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
