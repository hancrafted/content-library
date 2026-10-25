import { z } from 'zod';
import { AUDIENCES, EVENT_KINDS, isoDate, slug } from './fields';

/*
 * An Event: a dated workshop or webinar that presents one Playlist. It owns no Slides and holds no text: its title
 * and description are Translation keys by slug (FE-003), and it has no visibility of its own (design-ADR 0016).
 */

const CLOCK = /^\d{2}:\d{2}$/;

export const eventSchema = z
  .object({
    slug: slug.describe(
      'The date, then a readable name, `<date>-<name>`: a shared link says when and what, and Events sort by date',
    ),
    date: isoDate.describe('The day the Event takes place; once it lies before the build day, the Event is past'),
    kind: z.enum(EVENT_KINDS).describe('What kind of occasion it is, shown in its facts line'),
    audience: z.enum(AUDIENCES).describe('The Audience the Event targets'),
    time: z
      .string()
      .regex(CLOCK, 'must be written HH:MM')
      .optional()
      .describe('The start as the venue writes it, HH:MM; the same in every locale'),
    location: z.string().min(1).optional().describe('A place name, the same in every locale'),
    playlist: slug.describe("The id of the one Playlist the Event presents; that Playlist's visibility is the Event's"),
  })
  .describe('A dated occasion that presents one Playlist and owns no Slides and no text');

/** An Event record, as the store loads it. */
export type Event = z.infer<typeof eventSchema>;

/** An Event record as its file writes it, before the store parses it. */
export type EventInput = z.input<typeof eventSchema>;
