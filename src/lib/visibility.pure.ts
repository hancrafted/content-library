import type { EpisodeStatus } from './episode-metadata.pure';
import {
  isEpisodePage,
  isEpisodeSlug,
  isEventEpisodePage,
  isEventPage,
  isToolingPage,
  type EpisodeSlug,
  type PageRef,
} from './routes';

/*
 * The one visibility predicate (design-ADR 0016, "Visibility, indexing and canonical"; FE-008 §5): a page and the
 * facts of what it presents in, its sitemap membership, robots and canonical out. `pageMetadata` and the sitemap both
 * ask it, so they cannot disagree. Pure: the facts come from the content store through the composition roots.
 */

export type Visibility = 'public' | 'unlisted';

/** What a page presents, as far as its treatment depends on it. A page that presents no record passes `{}`. */
export interface PageFacts {
  /** The presented record's: an Episode's own, or, on an Event page, its Playlist's. */
  readonly visibility?: Visibility;
  /** An Episode's status: an upcoming one is kept out of search. */
  readonly status?: EpisodeStatus;
  /** The public Episode an unlisted one names as its original; its page takes the search credit. */
  readonly canonicalEpisode?: EpisodeSlug;
}

export interface PageTreatment {
  /** Listed in the sitemap: only self-canonical, indexable pages are. */
  readonly inSitemap: boolean;
  /** `false` emits `robots: noindex`; a page with a canonical elsewhere is never `noindex`. */
  readonly index: boolean;
  /** `self`, with hreflang alternates, or the public Episode whose `/episodes/<slug>/` URL is canonical. */
  readonly canonical: 'self' | { readonly episode: EpisodeSlug };
}

const LISTED: PageTreatment = { inSitemap: true, index: true, canonical: 'self' };
const HIDDEN: PageTreatment = { inSitemap: false, index: false, canonical: 'self' };

/** Indexed under another page's URL: out of the sitemap, no `noindex`, the canonical pointing there. */
function creditTo(episode: EpisodeSlug): PageTreatment {
  return { inSitemap: false, index: true, canonical: { episode } };
}

/** An Episode as its Event presents it: a public one credits its own page, an unlisted one its declared original. */
function eventEpisodeTreatment(episode: string, facts: PageFacts): PageTreatment {
  if (facts.visibility === 'public' && isEpisodeSlug(episode)) return creditTo(episode);
  if (facts.visibility === 'unlisted' && facts.canonicalEpisode !== undefined) return creditTo(facts.canonicalEpisode);
  return HIDDEN;
}

/** An Episode's own page: listed when public and published; an upcoming one, or one with no facts, stays hidden. */
function episodeTreatment(facts: PageFacts): PageTreatment {
  return facts.visibility === 'public' && facts.status === 'published' ? LISTED : HIDDEN;
}

/** A page's treatment, row by row of the visibility table. Missing facts never index a page that needs them. */
export function pageTreatment(page: PageRef, facts: PageFacts): PageTreatment {
  if (page === 'dashboard' || isToolingPage(page)) return HIDDEN;
  if (isEventEpisodePage(page)) return eventEpisodeTreatment(page.episode, facts);
  if (isEventPage(page)) return facts.visibility === 'public' ? LISTED : HIDDEN;
  return isEpisodePage(page) ? episodeTreatment(facts) : LISTED;
}
