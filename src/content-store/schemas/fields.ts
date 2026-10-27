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
export const ORGANIZERS = ['hancrafted', 'axel', 'cyberforum'] as const;

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
