import { z } from 'zod';

/*
 * Fragments and closed vocabularies the record schemas share. A fragment carries no `.describe()` of its own: each
 * field that uses it describes what it means there. Only zod is imported, so this stays a leaf every tier may read.
 */

/** Whether a record is listed and indexed. `attendees` waits for horizon 3 (design-ADR 0016 decision 9). */
export const VISIBILITIES = ['public', 'unlisted'] as const;

/** The Episode formats the overview filters by. */
export const FORMATS = ['foundations', 'teardown', 'short'] as const;
export type FormatId = (typeof FORMATS)[number];

/**
 * The closed Tag vocabulary: the only Tags an Episode or an Event may carry. Each Tag's icon and colour
 * token are in `./tag-looks.ts`, its colour per theme in `src/app/globals.css`; its name and tooltip are the
 * Translation keys `tags.<id>` in page assembly's lib.
 */
export const TAG_IDS = ['context-engineering', 'agentic-ai', 'markdown', 'cost', 'sales', 'workflow'] as const;
export type TagId = (typeof TAG_IDS)[number];

/**
 * What kind of Template record a page is, which also decides its URL (design-ADR 0019): an Episode template or a Master
 * slide. An Explorable page is its own record kind. The path of each is `TEMPLATE_TYPE_PATHS` in the content store's record routes.
 */
export const TEMPLATE_TYPES = ['episode-template', 'master-slide'] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

/** A YouTube video id: eleven characters of letters, digits, `-` and `_`. */
export const YOUTUBE_ID = /^[\w-]{11}$/;

/** Where an Event takes place: at a venue, on a video platform, or both. */
export const EVENT_FORMATS = ['onsite', 'remote', 'hybrid'] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

/** The video platforms a remote or hybrid Event runs on; a new one joins this list first. */
export const PLATFORMS = ['zoom', 'teams', 'google-meet'] as const;

/** What kind of occasion an Event is. */
export const EVENT_KINDS = ['workshop', 'webinar'] as const;

/** The Audience an Event targets (`docs/steering/product-vision.md`). */
export const AUDIENCES = ['individual', 'organization'] as const;

/** Who runs an Event: Han's own Events are `hancrafted`, a partner's carry its name, so a partner's Events group. */
export const ORGANIZER_IDS = ['hancrafted', 'axel', 'cyberforum'] as const;
export type OrganizerId = (typeof ORGANIZER_IDS)[number];

/** An Organizer as the Event page names it: its name and, when the repo knows one, the page that names it. */
export interface Organizer {
  readonly name: string;
  readonly url?: string;
}

/** The Organizer registry: each id's name and url, written once; a new Organizer joins `ORGANIZER_IDS` and this. */
export const ORGANIZERS: Readonly<Record<OrganizerId, Organizer>> = {
  hancrafted: { name: 'hancrafted', url: 'https://hancrafted.net' },
  axel: { name: 'AXEL', url: 'https://axel.energy/' },
  cyberforum: {
    name: 'CyberForum Akademie',
    url: 'https://www.cyberforum.de/akademie/kuenstliche-intelligenz-karl',
  },
};

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Only a date that survives a round trip is a day: `2026-02-30` has the shape but is not one. */
function isCalendarDay(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** A kebab-case id: a folder name, a URL segment. */
export const slug = z.string().regex(KEBAB, 'must be kebab-case');

/** A calendar day written `YYYY-MM-DD`. */
export const isoDate = z
  .string()
  .regex(ISO_DAY, 'must be written YYYY-MM-DD')
  .refine(isCalendarDay, 'is not a real calendar day');

/** A calendar day, `2026-10-23`. */
export type IsoDate = z.infer<typeof isoDate>;

/** A visibility, refusing a missing one and `attendees` in words the refusal can repeat. */
export const visibility = z.enum(VISIBILITIES, {
  error: (issue) => {
    if (issue.input === undefined) return 'is required, public or unlisted';
    if (issue.input === 'attendees') return 'is "attendees", which is refused until horizon 3 gives it an enforcer';
    return `is "${String(issue.input)}", but must be public or unlisted`;
  },
});

/** A value from a closed list, refusing a missing or unknown one in words the refusal can repeat. */
export function closed<const T extends readonly [string, ...string[]]>(values: T) {
  const list = values.join(', ');
  return z.enum(values, {
    error: (issue) =>
      issue.input === undefined
        ? `is required, one of ${list}`
        : `is "${String(issue.input)}", but must be one of ${list}`,
  });
}

const tag = closed(TAG_IDS);

/** A record's Tags, lead first, refusing none and an unknown one in the same words on every kind. */
export const tags = z.tuple([tag], tag, { error: 'is required, one Tag or more, the first its lead Tag' }).readonly();
