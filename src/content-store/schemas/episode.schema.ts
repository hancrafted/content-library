import { z } from 'zod';
import { FORMATS, isoDate, slug, TAG_IDS, visibility } from './fields';

/*
 * What an Episode declares about itself, in its own folder (`episodes/<slug>/episode-metadata.ts`): its overview
 * entry, its visibility and its Video. Ids and dates only; titles and captions stay Translation keys (FE-003).
 */

const YOUTUBE_ID = /^[\w-]{11}$/;
const tag = z.enum(TAG_IDS);

const shared = z.object({
  slug: slug.describe('The Episode slug: its folder name and the last part of its URL, unique across all Episodes'),
  visibility: visibility.describe(
    'public is listed and indexed at /episodes/<slug>/; unlisted lives only under the Event whose Playlist lists it, never listed. A missing one is refused, so a forgotten field fails closed',
  ),
  format: z.enum(FORMATS).describe('The Episode format the overview filters by'),
  tags: z
    .tuple([tag], tag)
    .readonly()
    .describe('Tag ids from the closed vocabulary, lead Tag first: the lead Tag gives the card its icon and accent'),
  youtube: z
    .union([
      z
        .strictObject({
          id: z.string().regex(YOUTUBE_ID).describe('The YouTube video id of the recording'),
          language: z
            .string()
            .describe('The locale spoken in the recording; both locale pages play it and label this language'),
        })
        .describe('An unlisted Episode: the one recording made at its Event'),
      z
        .record(z.string(), z.string().regex(YOUTUBE_ID))
        .describe('A public Episode: one YouTube video id per locale, by locale; none, one or both'),
    ])
    .optional()
    .describe('The Episode Video, optional until uploaded; its shape follows the visibility'),
});

export const episodeSchema = z
  .discriminatedUnion('status', [
    shared.extend({
      status: z.literal('published').describe('The Episode has a page and is announced'),
      publishedOn: isoDate.describe('The release date, a real calendar day'),
    }),
    shared.extend({
      status: z.literal('upcoming').describe('The Episode is announced but not written: no link, and noindex'),
    }),
  ])
  .describe('What an Episode declares about itself: its overview entry, its visibility and its Video');

/** An Episode's metadata record, as the store loads it. */
export type Episode = z.infer<typeof episodeSchema>;

/** An Episode's metadata record as its file writes it, before the store parses it. */
export type EpisodeInput = z.input<typeof episodeSchema>;

export type EpisodeStatus = Episode['status'];
export type PublishedEpisode = Extract<Episode, { status: 'published' }>;
export type UpcomingEpisode = Extract<Episode, { status: 'upcoming' }>;
