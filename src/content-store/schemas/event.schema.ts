import { z } from 'zod';
import { AUDIENCES, EVENT_KINDS, isoDate, ORGANIZERS, slug } from './fields';

/*
 * An Event: a dated workshop or webinar that presents one Playlist. It owns no Slides and holds no text: its title
 * and description are Translation keys by slug (FE-003), and it has no visibility of its own (design-ADR 0016). It
 * owns its copies of Episodes, each in its folder `episodes/by-event/<event-slug>/<slug>/` (decision 8).
 */

/** An organizer from the closed list, refusing a missing or unknown one in words the refusal can repeat. */
const organizer = z.enum(ORGANIZERS, {
  error: (issue) => {
    const list = ORGANIZERS.join(', ');
    if (issue.input === undefined) return `is required, one of ${list}`;
    return `is "${String(issue.input)}", but must be one of ${list}`;
  },
});

/** A start, or a start and an end, then an optional time zone: `17:00`, `17:00–19:00`, `17:00–19:00 CET`. */
const CLOCK = /^\d{2}:\d{2}(–\d{2}:\d{2})?( [A-Z]{2,5})?$/;

export const eventSchema = z
  .object({
    slug: slug.describe(
      'The date, then a readable name, `<date>-<name>`: a shared link says when and what, and Events sort by date',
    ),
    date: isoDate.describe('The day the Event takes place; once it lies before the build day, the Event is past'),
    kind: z.enum(EVENT_KINDS).describe('What kind of occasion it is, shown in its facts line'),
    organizer: organizer.describe(
      "Who runs the Event, from the closed list: hancrafted for Han's own, else the partner; a typo fails at load",
    ),
    audience: z.enum(AUDIENCES).describe('The Audience the Event targets'),
    time: z
      .string()
      .regex(CLOCK, 'must be written HH:MM, or HH:MM–HH:MM, with an optional zone')
      .optional()
      .describe(
        'The start, or start and end, as the venue writes it, with an optional zone: 17:00–19:00 CET; the same in every locale',
      ),
    location: z.string().min(1).optional().describe('A place name, the same in every locale'),
    playlist: slug.describe("The id of the one Playlist the Event presents; that Playlist's visibility is the Event's"),
  })
  .describe('A dated occasion that presents one Playlist and owns no Slides and no text');

/** An Event record, as the store loads it. */
export type Event = z.infer<typeof eventSchema>;

/** An Event record as its file writes it, before the store parses it. */
export type EventInput = z.input<typeof eventSchema>;
