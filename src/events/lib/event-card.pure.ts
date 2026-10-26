import { eventRoute, type EventSlug } from '@/content-store/catalogue/record-routes';
import type { Event } from '@/content-store/schemas/event.schema';
import type { IsoDate } from '@/content-store/schemas/fields';
import { dateLabelOf } from '@/shared/lib/date-label.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { EVENT_WORDS, eventCopy } from './event-words';

/**
 * One Event as its card draws it: the Event and the Playlist it presents, with their strings read in one locale.
 * Plain values only, so a Server Component can hand it on (FE-006 §4).
 */
export interface EventCard {
  readonly slug: string;
  /** The Event's locale-neutral logical path; a JSX `href` must be `localizePath(route, locale)` (FE-003). */
  readonly route: string;
  readonly title: string;
  readonly description: string;
  readonly date: IsoDate;
  /** `date` as the reader's locale writes it ("Oct 23, 2026", "23. Okt. 2026"). */
  readonly dateLabel: string;
  readonly time?: string;
  readonly location?: string;
  readonly episodeCount: number;
  /** "3 Episodes" in the reader's locale. */
  readonly episodeCountLabel: string;
}

/** What a card reads of an Event the store serves: its slug, its day and time, its place, and its Playlist's length. */
type CardEvent = Pick<Event, 'date' | 'time' | 'location'> & {
  readonly slug: EventSlug;
  readonly playlist: { readonly episodes: readonly unknown[] };
};

/**
 * Assembles one card, its words read through the Events area's word map: an Event's title and description by its
 * slug, which `tsc` holds to the Event registry, so a missing key fails the type check rather than ships a blank.
 */
export function eventCard(record: CardEvent, locale: Locale): EventCard {
  const count = record.playlist.episodes.length;
  const { title, description } = eventCopy(record.slug, locale);
  const { episodeCount } = EVENT_WORDS[locale];
  return {
    slug: record.slug,
    route: eventRoute(record.slug),
    title,
    description,
    date: record.date,
    dateLabel: dateLabelOf(record.date, locale),
    ...(record.time === undefined ? {} : { time: record.time }),
    ...(record.location === undefined ? {} : { location: record.location }),
    episodeCount: count,
    episodeCountLabel: count === 1 ? episodeCount.one : fillTemplate(episodeCount.other, { count }),
  };
}
