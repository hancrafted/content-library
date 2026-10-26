import type { Episode, EpisodeStatus } from '../content-store/schemas/episode.schema';
import {
  isEpisodePage,
  isEventEpisodePage,
  isEventPage,
  isToolingPage,
  type EpisodeSlug,
  type PageRef,
} from './routes';

/*
 * The one visibility predicate (design-ADR 0016, Routes and visibility; FE-008): a page and the facts of what it
 * presents in, whether it is exported, listed in the sitemap, indexed, and where its canonical points out. The
 * sitemap, page metadata and the `/episodes/` static params all ask it, so they cannot disagree. Pure: the facts come
 * from the content store through the composition roots (`src/components/pages/page-facts.ts`).
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
  /** `self`, with hreflang alternates, or the public Episode whose `/episodes/<slug>/` page takes the credit. */
  readonly canonical: 'self' | { readonly episode: EpisodeSlug };
}

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, canonical: 'self' };

/** An Episode's own page: listed when public and published, absent when unlisted, else hidden (fails closed). */
function episodeTreatment({ visibility, status }: PageFacts): PageTreatment {
  if (visibility === 'unlisted') return ABSENT;
  return visibility === 'public' && status === 'published' ? LISTED : HIDDEN;
}

/** An Episode under its Event: a public one credits its own page once that page is indexable; any other is hidden. */
function eventEpisodeTreatment(episode: EpisodeSlug, facts: PageFacts): PageTreatment {
  if (!episodeTreatment(facts).inSitemap) return HIDDEN;
  return { exported: true, inSitemap: false, index: true, canonical: { episode } };
}

/** A page's treatment, row by row of the visibility table. Missing facts never index a page that needs them. */
export function pageTreatment(page: PageRef, facts: PageFacts): PageTreatment {
  if (page === 'dashboard' || isToolingPage(page)) return HIDDEN;
  if (isEventEpisodePage(page)) return eventEpisodeTreatment(page.episode, facts);
  if (isEventPage(page)) return facts.visibility === 'public' ? LISTED : HIDDEN;
  return isEpisodePage(page) ? episodeTreatment(facts) : LISTED;
}
