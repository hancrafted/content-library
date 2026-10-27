import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, type EpisodeId, type EventSlug } from '@/content-store/catalogue/record-routes';
import type { LoadedEpisode } from './episode-refusals';
import type { Event } from './schemas/event.schema';
import type { Playlist, PlaylistItem } from './schemas/playlist.schema';

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
 * One entry of an Event's Playlist: the Episode's record with its ref, the anchor it opens at when it names one, its
 * ref again as `page` when it has a page (its URL slug and owning Event are fields of it), and its place.
 */
export interface PlaylistEntry {
  readonly episode: LoadedEpisode;
  readonly anchor?: string;
  readonly page?: EpisodeRef<EpisodeId>;
  readonly place: PlaylistPlace;
}

/** One entry as the store resolves it before it is placed: the loaded Episode, and the anchor it opens at. */
export interface ListedEntry {
  readonly episode: LoadedEpisode;
  readonly anchor?: string;
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

/** Each entry of a Playlist with its Episode loaded, in its order; an id no Episode holds is the Playlist's refusal. */
export function listedEntries(
  items: readonly PlaylistItem[],
  episodes: ReadonlyMap<string, LoadedEpisode>,
): ListedEntry[] {
  return items.flatMap(({ episode, anchor }) => {
    const loaded = episodes.get(episode);
    return loaded === undefined ? [] : [{ episode: loaded, ...(anchor === undefined ? {} : { anchor }) }];
  });
}

/**
 * Each entry of a Playlist, in its order, with its place: every entry is a step the count includes; the walk from one
 * Episode to the next steps over the pageless and over an Episode listed again, at an anchor or not.
 */
export function playlistEntries(entries: readonly ListedEntry[]): PlaylistEntry[] {
  const pages = entries.map(({ episode: { ref } }) => (hasPage(ref) ? ref : undefined));
  const isFirst = (index: number) =>
    entries.findIndex(({ episode }) => episode.ref.id === entries[index].episode.ref.id) === index;
  const stops = pages.map((page, index) => (isFirst(index) ? page : undefined));
  const isDefined = (page: EpisodeRef<EpisodeId> | undefined): page is EpisodeRef<EpisodeId> => page !== undefined;
  return entries.map(({ episode, anchor }, index) => {
    const page = pages[index];
    const previous = stops.slice(0, index).reverse().find(isDefined);
    const next = stops.slice(index + 1).find(isDefined);
    return {
      episode,
      ...(anchor === undefined ? {} : { anchor }),
      ...(page === undefined ? {} : { page }),
      place: {
        position: index + 1,
        count: entries.length,
        ...(previous === undefined ? {} : { previous }),
        ...(next === undefined ? {} : { next }),
      },
    };
  });
}
