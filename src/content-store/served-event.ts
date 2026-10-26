import { isEpisodeSlug, type EpisodeSlug, type EventSlug } from '@/lib/routes';
import type { Episode } from './schemas/episode.schema';
import type { Event } from './schemas/event.schema';
import type { Playlist } from './schemas/playlist.schema';

/*
 * An Event as the store serves it (design-ADR 0016, Delivery): resolved once, when the records load, into the Playlist
 * it presents and that Playlist's Episodes in order, each with its place. The Event page and its Event-scoped Episode
 * pages read this one value; nothing downstream looks a record up again.
 */

/**
 * Where one Episode sits in its Event's Playlist: its 1-based position, the count every listed Episode makes, and the
 * nearest Episode before and after it that has a page to walk to.
 */
export interface PlaylistPlace {
  readonly position: number;
  readonly count: number;
  readonly previous?: EpisodeSlug;
  readonly next?: EpisodeSlug;
}

/** One Episode an Event's Playlist lists: its record, its page's slug when it has a page, and its place. */
export interface PlaylistEntry {
  readonly episode: Episode;
  readonly page?: EpisodeSlug;
  readonly place: PlaylistPlace;
}

/**
 * An Event as the store serves it: its slug names a page (the generated Event registry), and its Playlist is resolved, the Episodes
 * it lists in its order, each with its place.
 */
export type ServedEvent = Omit<Event, 'slug' | 'playlist'> & {
  readonly slug: EventSlug;
  readonly playlist: Omit<Playlist, 'episodes'> & { readonly episodes: readonly PlaylistEntry[] };
};

/** Each Episode of a Playlist, in its order, with its place: the count is every one; the walk steps over the pageless. */
export function playlistEntries(episodes: readonly Episode[]): PlaylistEntry[] {
  const pages = episodes.map(({ slug }) => (isEpisodeSlug(slug) ? slug : undefined));
  const hasPage = (page: EpisodeSlug | undefined): page is EpisodeSlug => page !== undefined;
  return episodes.map((episode, index) => {
    const page = pages[index];
    const previous = pages.slice(0, index).reverse().find(hasPage);
    const next = pages.slice(index + 1).find(hasPage);
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
