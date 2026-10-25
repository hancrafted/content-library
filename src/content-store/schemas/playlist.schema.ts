import { z } from 'zod';
import { slug, visibility } from './fields';

/*
 * A Playlist: an ordered list of Episodes and its visibility, nothing else. Whether it is an event Playlist is read
 * from the Event side, never stored (design-ADR 0016 decision 9).
 */

export const playlistSchema = z
  .object({
    id: slug.describe('The Playlist id an Event names, and its file name under playlists/'),
    visibility: visibility.describe(
      "Whether the Playlist's own surfaces, an Event's pages included, are listed and indexed; a public Playlist no Event presents lists only public Episodes",
    ),
    episodes: z
      .array(z.string().describe('An Episode slug'))
      .describe('Episode slugs in the order the Playlist presents them; at least one, none twice'),
  })
  .describe('An ordered list of Episodes with a visibility; it never owns Slides');

/** A Playlist record, as the store loads it. */
export type Playlist = z.infer<typeof playlistSchema>;

/** A Playlist record as its file writes it, before the store parses it. */
export type PlaylistInput = z.input<typeof playlistSchema>;
