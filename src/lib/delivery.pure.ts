import type { EventRecord } from './events.pure';
import type { PlaylistRecord } from './playlists.pure';

/*
 * What the delivery records say about each other (design-ADR 0016, Delivery contract): an Event presents one
 * Playlist of `type: event` that opens with its event-frame Episode; a public standard Playlist lists only public
 * Episodes; an unlisted Episode belongs to an Event. The schemas check each record alone; this checks them together.
 */

/** The Episode fields the delivery checks read. */
export interface DeliveryEpisode {
  readonly slug: string;
  readonly type: 'standard' | 'event-frame';
  readonly visibility: 'public' | 'unlisted';
}

export interface DeliveryRecords {
  readonly episodes: readonly DeliveryEpisode[];
  readonly events: readonly EventRecord[];
  readonly playlists: readonly PlaylistRecord[];
}

/** One problem: the kind of record at fault, and a sentence that starts with its slug or id. */
export interface DeliveryProblem {
  readonly kind: 'event' | 'playlist' | 'episode';
  readonly message: string;
}

function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, at) => items.indexOf(item) !== at))];
}

function eventProblems({ events, playlists }: DeliveryRecords): DeliveryProblem[] {
  const fault = (message: string): DeliveryProblem => ({ kind: 'event', message });
  return [
    ...events.flatMap(({ slug, date, playlist }) => {
      const presented = playlists.find(({ id }) => id === playlist);
      return [
        ...(slug.startsWith(`${date}-`) ? [] : [fault(`${slug}: the slug must start with its date ${date}`)]),
        ...(presented === undefined
          ? [fault(`${slug}: presents the Playlist "${playlist}", which does not exist`)]
          : []),
        ...(presented !== undefined && presented.type !== 'event'
          ? [fault(`${slug}: presents the Playlist "${playlist}", which is not type: event`)]
          : []),
      ];
    }),
    ...duplicates(events.map(({ slug }) => slug)).map((slug) =>
      fault(`${slug}: the slug is used by more than one Event`),
    ),
  ];
}

const playlistFault = (message: string): DeliveryProblem => ({ kind: 'playlist', message });

/** What a Playlist's entries say about themselves: each one an Episode, none twice. */
function entryProblems({ id, episodes: entries }: PlaylistRecord, known: ReadonlySet<string>): DeliveryProblem[] {
  return [
    ...entries.filter((slug) => !known.has(slug)).map((slug) => playlistFault(`${id}: "${slug}" is not an Episode`)),
    ...duplicates(entries).map((slug) => playlistFault(`${id}: "${slug}" is listed twice`)),
  ];
}

/** A public standard Playlist lists only public Episodes and no event-frame one; an event Playlist may list unlisted ones. */
function standardProblems(playlist: PlaylistRecord, episodeOf: EpisodeLookup): DeliveryProblem[] {
  if (playlist.type !== 'standard') return [];
  const { id, visibility, episodes: entries } = playlist;
  const leaking = visibility === 'public' ? entries.filter((slug) => episodeOf(slug)?.visibility === 'unlisted') : [];
  const frames = entries.filter((slug) => episodeOf(slug)?.type === 'event-frame');
  return [
    ...leaking.map((slug) =>
      playlistFault(`${id}: a public standard Playlist lists only public Episodes, and "${slug}" is unlisted`),
    ),
    ...frames.map((slug) =>
      playlistFault(`${id}: a standard Playlist lists no event-frame Episode, and "${slug}" is one`),
    ),
  ];
}

/** An event Playlist is presented by exactly one Event and opens with its one event-frame Episode. */
function eventPlaylistProblems(
  playlist: PlaylistRecord,
  episodeOf: EpisodeLookup,
  presenters: number,
): DeliveryProblem[] {
  if (playlist.type !== 'event') return [];
  const { id, episodes: entries } = playlist;
  const frames = entries.filter((slug) => episodeOf(slug)?.type === 'event-frame');
  return [
    ...(presenters === 1
      ? []
      : [playlistFault(`${id}: a Playlist of type event is presented by exactly one Event, not ${presenters}`)]),
    ...(frames.length === 1 && frames[0] === entries[0]
      ? []
      : [playlistFault(`${id}: a Playlist of type event opens with its one event-frame Episode`)]),
  ];
}

type EpisodeLookup = (slug: string) => DeliveryEpisode | undefined;

function playlistProblems({ episodes, events, playlists }: DeliveryRecords): DeliveryProblem[] {
  const known = new Set(episodes.map(({ slug }) => slug));
  const episodeOf: EpisodeLookup = (slug) => episodes.find((episode) => episode.slug === slug);
  return [
    ...playlists.flatMap((playlist) => [
      ...entryProblems(playlist, known),
      ...standardProblems(playlist, episodeOf),
      ...eventPlaylistProblems(playlist, episodeOf, events.filter(({ playlist: id }) => id === playlist.id).length),
    ]),
    ...duplicates(playlists.map(({ id }) => id)).map((id) =>
      playlistFault(`${id}: the id is used by more than one Playlist`),
    ),
  ];
}

/** An unlisted Episode lives only under an Event, so one in no Event's Playlist is an orphan with no page. */
function orphanProblems({ episodes, events, playlists }: DeliveryRecords): DeliveryProblem[] {
  const presented = new Set(
    events.flatMap(({ playlist }) => playlists.find(({ id }) => id === playlist)?.episodes ?? []),
  );
  return episodes
    .filter(({ slug, visibility }) => visibility === 'unlisted' && !presented.has(slug))
    .map(({ slug }) => ({
      kind: 'episode',
      message: `${slug}: an unlisted Episode belongs to no Event, so it has no page`,
    }));
}

/** Every delivery problem, one sentence each; empty when the records are consistent. */
export function deliveryProblems(records: DeliveryRecords): DeliveryProblem[] {
  return [...eventProblems(records), ...playlistProblems(records), ...orphanProblems(records)];
}
