import { z } from 'zod';
import { slug, visibility } from './fields';

// decision: docs/adr/0016-content-data-model.md
const SLIDE_ANCHOR = /^[a-z0-9]+(-[a-z0-9]+)*(--[a-z0-9]+(-[a-z0-9]+)*)?$/;

const episodeId = z.string().describe("An Episode id: its slug, or `<event-slug>__<slug>` for an Event's copy");

const entry = z
  .union([
    episodeId.transform((episode): { episode: string; anchor?: string } => ({ episode })),
    z
      .object({
        episode: episodeId.describe('The Episode id the entry opens'),
        anchor: z
          .string()
          .regex(SLIDE_ANCHOR, 'must be a Section anchor or `<section>--<slide>`')
          .optional()
          .describe(
            "The anchor the entry opens in its Episode: a Section's, or one Slide's as `<section>--<slide>`; none opens the Episode's top",
          ),
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

export type Playlist = z.infer<typeof playlistSchema>;

export type PlaylistInput = z.input<typeof playlistSchema>;

export type StoredPlaylistEntry = Playlist['episodes'][number];
