/** A calendar day, `2026-10-23`. Spelled out here: importing it from the Episode metadata would loop back through the routes. */
type IsoDate = `${number}-${number}-${number}`;

/*
 * The Events: dated occasions, each presenting one Playlist (design-ADR 0016, Delivery contract). An Event owns no
 * Slides, holds no text (its title and description are Translation keys by slug, `eventsPage.items.<slug>`, FE-003)
 * and has no visibility or status of its own: its Playlist's visibility is its own, and its date decides whether it
 * is past. The content store loads these records through `eventSchema` and cross-checks them.
 */

/** What kind of occasion an Event is; data, so a workshop that becomes a webinar keeps its URL. */
export const EVENT_KINDS = ['workshop', 'webinar'] as const;

/** Who an Event targets: the two audiences the site serves (AGENTS.md, Audiences). */
export const AUDIENCES = ['german-business', 'international'] as const;

export interface EventRecord {
  /** The date, then a readable name, so a shared link says when and what: `2026-10-23-axel-agentic-workflow`. */
  readonly slug: string;
  readonly date: IsoDate;
  readonly kind: (typeof EVENT_KINDS)[number];
  /** The start as the venue writes it, `09:30`; the same in every locale. */
  readonly time?: string;
  /** A place name; the same in every locale. */
  readonly location?: string;
  readonly audience: (typeof AUDIENCES)[number];
  /** The id of the one Playlist of `type: event` the Event presents. */
  readonly playlist: string;
}

export const EVENTS = [
  {
    slug: '2026-10-23-axel-agentic-workflow',
    date: '2026-10-23',
    kind: 'workshop',
    audience: 'german-business',
    playlist: 'axel-agentic-workflow',
  },
] as const satisfies readonly EventRecord[];

export type EventSlug = (typeof EVENTS)[number]['slug'];

/**
 * Whether an Event is past: its date lies before the build day (design-ADR 0016, Past Event). Derived, never stored;
 * an Event built on its own day is still upcoming. ISO days compare as strings.
 */
export function isPastEvent(event: Pick<EventRecord, 'date'>, buildDay: IsoDate): boolean {
  return event.date < buildDay;
}
