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
