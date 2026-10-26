import type { Episode, EpisodeStatus } from '../content-store/schemas/episode.schema';
import { matchPage, type EpisodeSlug, type PageRef } from './routes';

/*
 * The one visibility predicate (design-ADR 0016, Routes and visibility; FE-008): a page and the facts of what it
 * presents in, whether it is exported, listed in the sitemap, indexed, shown on the site's own lists, and where its
 * canonical points out. The sitemap, page metadata, the `/episodes/` static params, the Episode overview and the
 * `/events/` list all ask it, so they cannot disagree. Pure: the facts come from the content store (`pageFacts` in
 * `src/content-store/store.ts`).
 */

/** What a page presents, as far as its treatment depends on it. A page that presents no record passes `{}`. */
export interface PageFacts {
  /** The presented record's visibility: an Episode's own, or, on an Event page, its Playlist's. */
  readonly visibility?: Episode['visibility'];
  /** An Episode's status: an upcoming one is kept out of search. */
  readonly status?: EpisodeStatus;
}

export interface PageTreatment {
  /** Whether the page is built at all: an unlisted Episode has no `/episodes/` page, only its Event's. */
  readonly exported: boolean;
  /** Listed in the sitemap: only an exported, indexable page that is its own canonical. */
  readonly inSitemap: boolean;
  /** `false` emits `robots: noindex`. */
  readonly index: boolean;
  /** Shown on the site's own lists: the Episode overview, Spotlight, Upcoming and `/events/`. */
  readonly listed: boolean;
  /** `self`, with hreflang alternates, or the public Episode whose `/episodes/<slug>/` page takes the credit. */
  readonly canonical: 'self' | { readonly episode: EpisodeSlug };
}

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' };
/** A public upcoming Episode: announced on the site's own lists, kept out of search. */
const ANNOUNCED: PageTreatment = { ...HIDDEN, listed: true };

/**
 * An Episode's own page, or the one it will have: listed when public and published, announced when public and
 * upcoming, absent when unlisted, else hidden (fails closed). An upcoming Episode without a page yet takes this row.
 */
export function episodePageTreatment({ visibility, status }: PageFacts): PageTreatment {
  if (visibility === 'unlisted') return ABSENT;
  if (visibility !== 'public') return HIDDEN;
  if (status === 'published') return LISTED;
  return status === 'upcoming' ? ANNOUNCED : HIDDEN;
}

/** An Episode under its Event: a public one credits its own page once that page is indexable; any other is hidden. */
function eventEpisodeTreatment(episode: EpisodeSlug, facts: PageFacts): PageTreatment {
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
      episode: () => episodePageTreatment(facts),
      tooling: () => HIDDEN,
      event: () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      'event-episode': ({ episode }) => eventEpisodeTreatment(episode, facts),
    },
    () => ABSENT,
  );
}
