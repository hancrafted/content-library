import type { Episode, EpisodeStatus } from '../schemas/episode.schema';
import { matchPage, type EpisodeId, type PageRef } from './record-routes';

/*
 * The one visibility predicate (design-ADR 0016, Routes and visibility; FE-008): a page and the facts of what it
 * presents in, whether it is exported, listed in the sitemap, indexed, shown on the site's own lists, and where its
 * canonical points out. The sitemap, page metadata, the `/episodes/` static params, the Episode browser and the
 * `/events/` list all ask it, so they cannot disagree. Pure: the facts come from the content store (`pageFacts` in
 * `src/content-store/store.ts`).
 */

/** What a page presents, as far as its treatment depends on it. A page that presents no record passes `{}`. */
export interface PageFacts {
  /** The presented record's visibility: an Episode's own, a Template's own, or, on an Event page, its Playlist's. */
  readonly visibility?: Episode['visibility'];
  /** An Episode's status: an upcoming one is kept out of search. */
  readonly status?: EpisodeStatus;
  /** The Episode is an Event's copy (design-ADR 0016 decision 8): it lives under its Event only, never at `/episodes/`. */
  readonly copy?: boolean;
}

export interface PageTreatment {
  /** Whether the page is built at all: an unlisted Episode has no `/episodes/` page, only its Event's. */
  readonly exported: boolean;
  /** Listed in the sitemap: only an exported, indexable page that is its own canonical. */
  readonly inSitemap: boolean;
  /** `false` emits `robots: noindex`. */
  readonly index: boolean;
  /** Shown on the site's own lists: the Episode browser, Spotlight, Upcoming and `/events/`. */
  readonly listed: boolean;
  /** `self`, with hreflang alternates, or the public Episode whose `/episodes/<slug>/` page takes the credit. */
  readonly canonical: 'self' | { readonly episode: EpisodeId };
}

/** One page and how the site treats it: what the page catalogue lists and the sitemap reads. */
export interface TreatedPage {
  readonly page: PageRef;
  readonly treatment: PageTreatment;
}

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' };
/** A public upcoming Episode: announced on the site's own lists, kept out of search. */
const ANNOUNCED: PageTreatment = { ...HIDDEN, listed: true };
/** A public Event's copy under its Event: indexed and in the sitemap at that URL, its own canonical, never listed. */
const SELF_INDEXED: PageTreatment = { ...LISTED, listed: false };

/**
 * An Episode's own page, or the one it will have: listed when public and published, announced when public and
 * upcoming, absent when unlisted or an Event's copy, else hidden (fails closed). An upcoming Episode without a page yet
 * takes this row.
 */
export function episodePageTreatment({ visibility, status, copy }: PageFacts): PageTreatment {
  if (visibility === 'unlisted' || copy) return ABSENT;
  if (visibility !== 'public') return HIDDEN;
  if (status === 'published') return LISTED;
  return status === 'upcoming' ? ANNOUNCED : HIDDEN;
}

/**
 * An Episode under its Event: a public, published copy of that Event is its own indexed page there; any other public
 * Episode credits its own page once that page is indexable; any other is hidden.
 */
function eventEpisodeTreatment(episode: EpisodeId, facts: PageFacts): PageTreatment {
  if (facts.copy) return facts.visibility === 'public' && facts.status === 'published' ? SELF_INDEXED : HIDDEN;
  if (!episodePageTreatment(facts).inSitemap) return HIDDEN;
  return { exported: true, inSitemap: false, index: true, listed: false, canonical: { episode } };
}

/**
 * A page's treatment, row by row of the visibility table, one case per page kind. Fails closed: missing facts never
 * index a page that needs them, and a page of a kind no case names is never built, listed or indexed.
 */
export function pageTreatment(page: PageRef, facts: PageFacts): PageTreatment {
  return matchPage(
    page,
    {
      home: () => LISTED,
      dashboard: () => HIDDEN,
      episodes: () => LISTED,
      events: () => LISTED,
      explorables: () => LISTED,
      resources: () => LISTED,
      episode: () => episodePageTreatment(facts),
      'explorable-page': () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      template: () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      event: () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      'event-episode': ({ episode }) => eventEpisodeTreatment(episode.id, facts),
    },
    () => ABSENT,
  );
}
