import type { EventSlug } from '@/lib/events.pure';
import { isEpisodePage, isEventEpisodePage, isEventPage, type AnyEpisodeSlug, type PageRef } from '@/lib/routes';
import type { PageFacts } from '@/lib/visibility.pure';
import { contentStore } from './content-store';
import { episodeStatus } from './episode-repository';

/*
 * The facts the visibility predicate (`pageTreatment`) needs, read from the content store. The predicate lives in
 * `src/lib` and cannot reach the store (FE-007 §2), so `pageMetadata` and the sitemap take these as data: one
 * reader, so the two ask with the same facts.
 */

/** An Episode's visibility, status and declared original. The page template has no metadata: public, published. */
export function episodeFacts(slug: AnyEpisodeSlug): PageFacts {
  const episode = contentStore().episodes.find((entry) => entry.slug === slug);
  const status = episodeStatus(slug);
  if (episode === undefined) return { visibility: 'public', status };
  const canonical = episode.status === 'published' ? episode.canonicalEpisode : undefined;
  return {
    visibility: episode.visibility,
    status,
    ...(canonical === undefined ? {} : { canonicalEpisode: canonical }),
  };
}

/** An Event page's facts: its Playlist's visibility, which is the Event's. */
export function eventFacts(slug: EventSlug): PageFacts {
  const { events, playlists } = contentStore();
  const playlist = playlists.find(({ id }) => id === events.find((event) => event.slug === slug)?.playlist);
  return playlist === undefined ? {} : { visibility: playlist.visibility };
}

/** Any page's facts: an Episode's or an Event's; none for a page that presents no record. */
export function pageFacts(page: PageRef): PageFacts {
  if (isEpisodePage(page) || isEventEpisodePage(page)) return episodeFacts(page.episode);
  if (isEventPage(page)) return eventFacts(page.event);
  return {};
}
