import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, type EpisodeId, type EventSlug } from '@/content-store/catalogue/record-routes';
import type { LoadedEpisode } from './episode-refusals';
import type { Event } from './schemas/event.schema';
import type { Playlist, StoredPlaylistEntry } from './schemas/playlist.schema';

// decision: docs/adr/0016-content-data-model.md
export interface PlaylistPlace {
  readonly position: number;
  readonly count: number;
  readonly previous?: EpisodeRef<EpisodeId>;
  readonly next?: EpisodeRef<EpisodeId>;
}

export interface PlaylistEntry {
  readonly episode: LoadedEpisode;
  readonly anchor?: string;
  readonly repeat?: true;
  readonly page?: EpisodeRef<EpisodeId>;
  readonly place: PlaylistPlace;
}

export interface ListedEntry {
  readonly episode: LoadedEpisode;
  readonly anchor?: string;
}

export type ServedEvent = Omit<Event, 'slug' | 'playlist'> & {
  readonly slug: EventSlug;
  readonly playlist: Omit<Playlist, 'episodes'> & { readonly episodes: readonly PlaylistEntry[] };
};

export interface PresentedEpisode {
  readonly event: ServedEvent;
  readonly episode: EpisodeRef<EpisodeId>;
  readonly place: PlaylistPlace;
}

export function listedEntries(
  items: readonly StoredPlaylistEntry[],
  episodes: ReadonlyMap<string, LoadedEpisode>,
): ListedEntry[] {
  return items.flatMap(({ episode, anchor }) => {
    const loaded = episodes.get(episode);
    return loaded === undefined ? [] : [{ episode: loaded, ...(anchor === undefined ? {} : { anchor }) }];
  });
}

export function playlistEntries(entries: readonly ListedEntry[]): PlaylistEntry[] {
  const pages = entries.map(({ episode: { ref } }) => (hasPage(ref) ? ref : undefined));
  const repeats = entries.map(({ episode }, index) =>
    entries.slice(0, index).some((earlier) => earlier.episode.ref.id === episode.ref.id),
  );
  const stops = pages.map((page, index) => (repeats[index] ? undefined : page));
  const isDefined = (page: EpisodeRef<EpisodeId> | undefined): page is EpisodeRef<EpisodeId> => page !== undefined;
  return entries.map(({ episode, anchor }, index) => {
    const page = pages[index];
    const previous = stops.slice(0, index).reverse().find(isDefined);
    const next = stops.slice(index + 1).find(isDefined);
    return {
      episode,
      ...(anchor === undefined ? {} : { anchor }),
      ...(repeats[index] ? { repeat: true as const } : {}),
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
