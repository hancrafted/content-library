/*
 * The Playlists: ordered lists of Episode ids with a type and a visibility, and nothing else (design-ADR 0016,
 * Delivery contract). A `type: event` Playlist is made for exactly one Event and opens with that Event's event-frame
 * Episode; a `type: standard` one is a curated list with no Event. `visibility` says whether the Playlist's own
 * surfaces (for an Event Playlist, the Event's pages) are listed and indexed. The content store loads these records
 * through `playlistSchema` and cross-checks them.
 */

export const PLAYLIST_TYPES = ['event', 'standard'] as const;

/** `attendees` is not among them until horizon 3 gives it an enforcer: a static site cannot hide a page. */
export const VISIBILITIES = ['public', 'unlisted'] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export interface PlaylistRecord {
  readonly id: string;
  readonly type: (typeof PLAYLIST_TYPES)[number];
  readonly visibility: Visibility;
  /** Episode slugs in the order the Playlist presents them. */
  readonly episodes: readonly string[];
}

export const PLAYLISTS = [
  {
    // A client Event: unlisted, so its pages stay out of search and the Events index (decided-for-Han, test run).
    id: 'axel-agentic-workflow',
    type: 'event',
    visibility: 'unlisted',
    episodes: ['axel-agentic-workflow-agenda', 'onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'],
  },
] as const satisfies readonly PlaylistRecord[];

/** Where one Episode sits in a Playlist: its 1-based position, the count, and its neighbours' slugs, when it has them. */
export interface PlaylistPosition {
  readonly position: number;
  readonly count: number;
  readonly previous?: string;
  readonly next?: string;
}

/** The Episode's place in the Playlist's order, for an Event-scoped Episode page; throws on a slug the Playlist does not hold. */
export function playlistPosition(episodes: readonly string[], slug: string): PlaylistPosition {
  const index = episodes.indexOf(slug);
  if (index === -1) throw new Error(`The Playlist holds no Episode "${slug}"`);
  const previous = episodes[index - 1];
  const next = episodes[index + 1];
  return {
    position: index + 1,
    count: episodes.length,
    ...(previous === undefined ? {} : { previous }),
    ...(next === undefined ? {} : { next }),
  };
}

/** The chip an Event page's Playlist card carries (design-ADR 0016, Event page behaviour). */
export type PlaylistChip = 'event-frame' | 'unlisted';

/** The event-frame Episode is chipped as the Event page, any other unlisted Episode as unlisted; a public one has none. */
export function playlistChip(episode: {
  readonly type: 'standard' | 'event-frame';
  readonly visibility: Visibility;
}): PlaylistChip | undefined {
  if (episode.type === 'event-frame') return 'event-frame';
  return episode.visibility === 'unlisted' ? 'unlisted' : undefined;
}
