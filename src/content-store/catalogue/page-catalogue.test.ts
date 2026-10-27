import { pageLocales, resourceRoute, routeOf, type PageRef } from '@/content-store/catalogue/record-routes';
import { describe, expect, it } from 'vitest';
import { loadContent } from '../store';
import { episodeRef, resourceRef } from './episode-id.pure';
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
  organizers: ['axel'],
  audience: 'organization',
  tags: ['agentic-ai'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'axel',
} as const;
/** The records as the generated registry hands them in, each Episode under the id its folder gives it. */
const own = (record: { readonly slug: string }) => ({ id: record.slug, record });
const copy = (record: object) => ({ id: COPY.id, record });
const RECORDS = {
  episodes: [own(PUBLIC), copy(UNLISTED)],
  events: [EVENT],
  playlists: [PLAYLIST],
  resources: [],
  resourceCompositions: [],
};

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
        episodesPages: [PUBLIC.slug],
      },
      public: {
        own: ABSENT,
        underEvent: SELF_INDEXED,
        overview: [PUBLIC.slug],
        episodesPages: [PUBLIC.slug],
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
    const expected = [{ kind: 'episode', episode: PUBLIC_REF }];
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

  it('lists the six Resource pages and the overview, indexed and in the sitemap, each at the URL its type and slug give', () => {
    // ARRANGE
    const expected = [
      '/resources',
      '/explorable-explanations/context-window',
      '/explorable-explanations/human-in-the-loop',
      '/episode-templates/episode-template',
      '/episode-templates/workshop-template',
      '/master-slides/timelines',
      '/master-slides/grids',
    ];
    // ACT
    const pages = catalogueOf(loadContent(WITH_RESOURCES)).pages.filter(
      ({ page }) => page.kind === 'resource' || page.kind === 'resources',
    );
    // ASSERT
    expect(pages.map(({ page }) => routeOf(page)).sort()).toEqual([...expected].sort());
    expect(pages.every(({ treatment }) => treatment.inSitemap && treatment.index && treatment.exported)).toBe(true);
  });

  it('builds each Resource page in both locales', () => {
    // ARRANGE
    const expected = 12;
    // ACT
    const count = catalogueOf(loadContent(WITH_RESOURCES))
      .pages.filter(({ page }) => page.kind === 'resource')
      .flatMap(({ page }) => pageLocales(page)).length;
    // ASSERT
    expect(count).toBe(expected);
  });

  it('derives the route from the type and the slug alone', () => {
    // ARRANGE
    const expected = '/master-slides/grids';
    // ACT
    const route = resourceRoute('master-slide', 'grids');
    // ASSERT
    expect(route).toBe(expected);
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

  it('lists only public Resources on the overview and indexes no unlisted one', () => {
    // ARRANGE
    const hidden = RESOURCE_RECORDS.map((record) =>
      record.slug === 'grids' ? { ...record, visibility: 'unlisted' } : record,
    );
    const records = { ...WITH_RESOURCES, resources: hidden };
    // ACT
    const catalogue = catalogueOf(loadContent(records));
    const treatment = catalogue.treatmentOf({
      kind: 'resource',
      type: 'master-slide',
      resource: resourceRef('grids' as never),
    });
    // ASSERT
    expect(catalogue.listedResources().map(({ page }) => page.resource.slug)).not.toContain('grids');
    expect(treatment).toMatchObject({ exported: true, index: false, inSitemap: false });
  });
});

describe('edge cases', () => {
  it("lists every page once: the site lists, each Episode but an Event's copy, each Event, then each Episode under it", () => {
    // ARRANGE
    const expected: PageRef[] = [
      { kind: 'home' },
      { kind: 'dashboard' },
      { kind: 'episodes' },
      { kind: 'events' },
      { kind: 'resources' },
      { kind: 'episode', episode: PUBLIC_REF },
      { kind: 'event', event: AXEL },
      { kind: 'event-episode', event: AXEL, episode: PUBLIC_REF },
      { kind: 'event-episode', event: AXEL, episode: COPY },
    ];
    // ACT
    const pages = catalogueOf(loadContent(RECORDS)).pages.map(({ page }) => page);
    // ASSERT
    expect(pages).toEqual(expected);
  });

  it('builds one page under the Event for an Episode the Playlist lists again at an anchor, placed by its first entry', () => {
    // ARRANGE
    const playlist = { ...PLAYLIST, episodes: [PUBLIC.slug, COPY.id, { episode: PUBLIC.slug, anchor: 'check-in-1' }] };
    const count = playlist.episodes.length;
    const expected = [
      { episode: PUBLIC_REF.id, place: { position: 1, count, next: COPY } },
      { episode: COPY.id, place: { position: 2, count, previous: PUBLIC_REF } },
    ];
    const catalogue = catalogueOf(loadContent({ ...RECORDS, playlists: [playlist] }));
    // ACT
    const pages = catalogue.eventEpisodeParams().map((param) => catalogue.eventEpisodePageAt(param));
    // ASSERT
    expect(pages.map((page) => page && { episode: page.episode.id, place: page.presented.place })).toEqual(expected);
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

  it('gives each type its own static params and resolves a slug only under its own type', () => {
    // ARRANGE
    const catalogue = catalogueOf(loadContent(WITH_RESOURCES));
    // ACT
    const seen = {
      masterSlides: catalogue.resourceParams('master-slide'),
      right: catalogue.resourcePageAt('master-slide', { resource: 'grids' })?.resource.slug,
      wrongType: catalogue.resourcePageAt('episode-template', { resource: 'grids' }),
    };
    // ASSERT
    expect(seen).toEqual({
      masterSlides: [{ resource: 'timelines' }, { resource: 'grids' }],
      right: 'grids',
      wrongType: undefined,
    });
  });
});

/*
 * Resources (design-ADR 0019): a Resource's page is built from its record, at `/<type plural>/<slug>/`, public and
 * indexed. The slugs are registered ones: only a composition folder gives a Resource a page.
 */
const SIX = {
  'context-window': 'explorable-explanation',
  'human-in-the-loop': 'explorable-explanation',
  'episode-template': 'episode-template',
  'workshop-template': 'episode-template',
  timelines: 'master-slide',
  grids: 'master-slide',
} as const;
const RESOURCE_RECORDS = Object.entries(SIX).map(([slug, type]) => ({
  slug,
  type,
  tags: ['workflow'],
  visibility: 'public',
}));
const WITH_RESOURCES = { ...RECORDS, resources: RESOURCE_RECORDS, resourceCompositions: Object.keys(SIX) };
