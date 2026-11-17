import { z } from 'zod';
import { AUDIENCES, closed, EVENT_FORMATS, EVENT_KINDS, isoDate, ORGANIZER_IDS, PLATFORMS, slug, tags } from './fields';

// decision: FE-003 §4
// decision: docs/decision-records/0016-content-data-model.md
const organizer = closed(ORGANIZER_IDS);
const ORGANIZERS_REQUIRED = 'is required, one Organizer or more, the first its lead';

// decision: FE-003 §2.2
const httpsUrl = z.string().refine((url) => URL.canParse(url) && url.startsWith('https://'), 'must be an https URL');

const IMAGE_FOLDER = '/images/events/';

const AT_VENUE: readonly string[] = ['onsite', 'hybrid'];
const ON_PLATFORM: readonly string[] = ['remote', 'hybrid'];

interface Place {
  readonly format: string;
  readonly venue?: string;
  readonly platform?: string;
}

const NEEDED_BY = { venue: AT_VENUE, platform: ON_PLATFORM } as const;

function placeIssue(event: Place, field: keyof typeof NEEDED_BY): { path: string[]; message: string } | undefined {
  const needed = NEEDED_BY[field].includes(event.format);
  const given = event[field] !== undefined;
  const article = event.format === 'onsite' ? 'an' : 'a';
  if (needed && !given) return { path: [field], message: `is required when the format is ${event.format}` };
  if (!needed && given) return { path: [field], message: `is set, but ${article} ${event.format} Event has none` };
  return undefined;
}

function placeIssues(event: Place) {
  return [placeIssue(event, 'venue'), placeIssue(event, 'platform')].filter((issue) => issue !== undefined);
}

const CLOCK = /^\d{2}:\d{2}(–\d{2}:\d{2})?( [A-Z]{2,5})?$/;

export const eventSchema = z
  .object({
    slug: slug.describe(
      'The date, then a readable name, `<date>-<name>`: a shared link says when and what, and Events sort by date',
    ),
    date: isoDate.describe('The day the Event takes place; once it lies before the build day, the Event is past'),
    kind: z.enum(EVENT_KINDS).describe('What kind of occasion it is, shown in its facts line'),
    organizers: z
      .tuple([organizer], organizer, { error: ORGANIZERS_REQUIRED })
      .readonly()
      .describe(
        "Who runs the Event, lead first, from the closed list: hancrafted for Han's own, else the partner; a typo fails at load",
      ),
    listing: httpsUrl.optional().describe("The partner's own page for this Event, https only"),
    references: z
      .array(
        z
          .object({
            label: z.string().min(1).describe('The link text, the same in every locale'),
            url: httpsUrl.describe('Where the link goes, https only'),
          })
          .readonly(),
      )
      .readonly()
      .optional()
      .describe(
        'Further links the Event page lists under See also: a label, the same in every locale, and an https url',
      ),
    image: z
      .object({
        src: z
          .string()
          .startsWith(IMAGE_FOLDER, `must sit under ${IMAGE_FOLDER}`)
          .describe('The image file as a public path, under /images/events/'),
        credit: z.string().min(1).describe('The credit line shown under the image, the same in every locale'),
      })
      .readonly()
      .optional()
      .describe(
        'The Event page image: its path under /images/events/ and its credit; its alt is the Translation key `eventPage.imageAlt.<slug>`',
      ),
    audience: z.enum(AUDIENCES).describe('The Audience the Event targets'),
    time: z
      .string()
      .regex(CLOCK, 'must be written HH:MM, or HH:MM–HH:MM, with an optional zone')
      .optional()
      .describe(
        'The start, or start and end, as the venue writes it, with an optional zone: 17:00–19:00 CET; the same in every locale',
      ),
    tags: tags.describe(
      'Tag ids from the closed vocabulary, lead Tag first: the lead Tag gives the card its icon and accent, and the overview filters by every Tag',
    ),
    format: closed(EVENT_FORMATS).describe(
      'Where the Event takes place: onsite at its venue, remote on its platform, or hybrid on both',
    ),
    venue: z
      .string()
      .min(1)
      .optional()
      .describe(
        'The place, as the venue writes it, the same in every locale; required onsite and hybrid, refused remote',
      ),
    platform: closed(PLATFORMS)
      .optional()
      .describe('The video platform attendees join on; required remote and hybrid, refused onsite'),
    playlist: slug.describe("The id of the one Playlist the Event presents; that Playlist's visibility is the Event's"),
  })
  .superRefine((event, ctx) => {
    for (const issue of placeIssues(event)) ctx.addIssue({ code: 'custom', ...issue });
  })
  .describe('A dated occasion that presents one Playlist and owns no Slides and no text');

export type Event = z.infer<typeof eventSchema>;

export type EventInput = z.input<typeof eventSchema>;
