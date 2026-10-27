import { z } from 'zod';
import { slug, visibility } from './fields';

/*
 * A Playlist: an ordered list of entries and its visibility, nothing else. Whether it is an event Playlist is read
 * from the Event side, never stored (design-ADR 0016 decision 9). An entry is an Episode, or a place in one by its
 * anchor; an Episode may be listed again at another anchor.
 */

const episodeId = z.string().describe("An Episode id: its slug, or `<event-slug>__<slug>` for an Event's copy");

/** A Playlist entry written as the Episode id alone or with an anchor, parsed to one shape: `{ episode, anchor? }`. */
const entry = z
  .union([
    episodeId.transform((episode): { episode: string; anchor?: string } => ({ episode })),
    z
      .object({
        episode: episodeId.describe('The Episode id the entry opens'),
        anchor: slug
          .optional()
          .describe("The anchor of the Section the entry opens in its Episode; none opens the Episode's top"),
      })
      .strict()
      .describe('An Episode, opened at one of its anchors'),
  ])
  .describe('A Playlist entry: an Episode id, or `{ episode, anchor }` for a place in it');

export const playlistSchema = z
  .object({
    id: slug.describe('The Playlist id an Event names, and its file name under playlists/'),
    visibility: visibility.describe(
      "Whether the Playlist's own surfaces, an Event's pages included, are listed and indexed; a public Playlist no Event presents lists only public Episodes",
    ),
    episodes: z
      .array(entry)
      .describe(
        "Entries in the order the Playlist presents them, each a numbered step; at least one, no other Event's copy",
      ),
  })
  .describe('An ordered list of Episode entries with a visibility; it never owns Slides');

/** A Playlist record, as the store loads it. */
export type Playlist = z.infer<typeof playlistSchema>;

/** A Playlist record as its file writes it, before the store parses it. */
export type PlaylistInput = z.input<typeof playlistSchema>;

/** One Playlist entry, as the store loads it: the Episode id, and the anchor it opens at. */
export type StoredPlaylistEntry = Playlist['episodes'][number];
