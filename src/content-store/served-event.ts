import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, type EpisodeId, type EventSlug } from '@/content-store/catalogue/record-routes';
import type { LoadedEpisode } from './episode-refusals';
import type { Event } from './schemas/event.schema';
import type { Playlist } from './schemas/playlist.schema';

/*
 * An Event as the store serves it (design-ADR 0016, Delivery): resolved once, when the records load, into the Playlist
 * it presents and that Playlist's Episodes in order, each with its place. The Event page and its Event-scoped Episode
 * pages read this one value; nothing downstream looks a record up again.
 */

/**
 * Where one Episode sits in its Event's Playlist: its 1-based position, the count every listed Episode makes, and the
 * nearest Episode before and after it that has a page to walk to, by EpisodeRef.
 */
export interface PlaylistPlace {
  readonly position: number;
  readonly count: number;
  readonly previous?: EpisodeRef<EpisodeId>;
  readonly next?: EpisodeRef<EpisodeId>;
}

/**
 * One Episode an Event's Playlist lists: its record with its ref, its ref again as `page` when it has a page (its URL
 * slug and owning Event are fields of it), and its place.
 */
export interface PlaylistEntry {
  readonly episode: LoadedEpisode;
  readonly page?: EpisodeRef<EpisodeId>;
  readonly place: PlaylistPlace;
}

/**
 * An Event as the store serves it: its slug names a page (the generated Event registry), and its Playlist is
 * resolved, the Episodes it lists in its order, each with its place.
 */
export type ServedEvent = Omit<Event, 'slug' | 'playlist'> & {
  readonly slug: EventSlug;
  readonly playlist: Omit<Playlist, 'episodes'> & { readonly episodes: readonly PlaylistEntry[] };
};

/**
 * One Episode an Event presents on its own page under the Event: the served Event, the Episode's page as its
 * EpisodeRef, and its place in the Playlist. The page catalogue resolves it from the page's route params.
 */
export interface PresentedEpisode {
  readonly event: ServedEvent;
  readonly episode: EpisodeRef<EpisodeId>;
  readonly place: PlaylistPlace;
}

/** Each Episode of a Playlist, in its order, with its place: the count is every one; the walk steps over the pageless. */
export function playlistEntries(episodes: readonly LoadedEpisode[]): PlaylistEntry[] {
  const pages = episodes.map(({ ref }) => (hasPage(ref) ? ref : undefined));
  const isDefined = (page: EpisodeRef<EpisodeId> | undefined): page is EpisodeRef<EpisodeId> => page !== undefined;
  return episodes.map((episode, index) => {
    const page = pages[index];
    const previous = pages.slice(0, index).reverse().find(isDefined);
    const next = pages.slice(index + 1).find(isDefined);
    return {
      episode,
      ...(page === undefined ? {} : { page }),
      place: {
        position: index + 1,
        count: episodes.length,
        ...(previous === undefined ? {} : { previous }),
        ...(next === undefined ? {} : { next }),
      },
    };
  });
}
