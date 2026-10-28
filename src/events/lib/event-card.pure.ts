import { eventRoute, type EventSlug } from '@/content-store/catalogue/record-routes';
import type { Event } from '@/content-store/schemas/event.schema';
import type { EventFormat, IsoDate, TagId } from '@/content-store/schemas/fields';
import { dateLabelOf, weekdayLabelOf } from '@/shared/lib/date-label.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { EVENT_WORDS, eventCopy } from './event-words';

/** One Tag's name and tooltip in the reader's locale. */
export interface TagWords {
  readonly name: string;
  readonly tooltip: string;
}

/**
 * Every Tag's words in one locale, as page assembly reads them from their owner's Translation files (`tags.*`) and
 * hands them in: the Events area owns no Tag words (FE-007 §2.4).
 */
export type TagWordMap = Readonly<Record<TagId, TagWords>>;

/** One Tag as a card draws it: its id, its name and the tooltip that explains it. */
export interface EventTag {
  readonly id: TagId;
  readonly label: string;
  readonly tooltip: string;
}

/** Where the Event takes place, as one line: the venue, the platform, or both for a hybrid Event. */
export interface EventPlace {
  readonly format: EventFormat;
  readonly label: string;
}

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
  /** The day of the month ("23") and its short weekday in the reader's locale ("Fri", "Fr"), for a calendar row. */
  readonly day: string;
  readonly weekday: string;
  readonly time?: string;
  /** The Event's first Tag, which gives its card the icon and accent. */
  readonly leadTag: TagId;
  /** The Event's Tags in its own order, lead Tag first. */
  readonly tags: readonly EventTag[];
  readonly place: EventPlace;
  readonly episodeCount: number;
  /** "3 Episodes" in the reader's locale. */
  readonly episodeCountLabel: string;
}

/**
 * What a card reads of an Event the store serves: its slug, day and time, Tags, place, and the Episode of each
 * Playlist entry by its slug, unique within a Playlist.
 */
type CardEvent = Pick<Event, 'date' | 'time' | 'tags' | 'format' | 'venue' | 'platform'> & {
  readonly slug: EventSlug;
  readonly playlist: { readonly episodes: readonly { readonly episode: { readonly slug: string } }[] };
};

/** The place line: the venue onsite, "Remote · Zoom" remote, both joined for a hybrid Event. */
function placeOf(record: CardEvent, locale: Locale): EventPlace {
  const words = EVENT_WORDS[locale];
  const platform = record.platform === undefined ? undefined : words.platforms[record.platform];
  const parts =
    record.format === 'remote'
      ? [words.remote, platform]
      : record.format === 'hybrid'
        ? [record.venue, platform]
        : [record.venue];
  return { format: record.format, label: parts.filter((part) => part !== undefined).join(' · ') };
}

/**
 * Assembles one card, its words read through the Events area's word map: an Event's title and description by its
 * slug, which `tsc` holds to the Event registry, so a missing key fails the type check rather than ships a blank.
 * The Tags' words arrive from page assembly.
 */
export function eventCard(record: CardEvent, locale: Locale, tagWords: TagWordMap): EventCard {
  // An Episode listed again at an anchor is still one Episode.
  const count = new Set(record.playlist.episodes.map(({ episode }) => episode.slug)).size;
  const { title, description } = eventCopy(record.slug, locale);
  const { episodeCount } = EVENT_WORDS[locale];
  return {
    slug: record.slug,
    route: eventRoute(record.slug),
    title,
    description,
    date: record.date,
    dateLabel: dateLabelOf(record.date, locale),
    day: String(Number(record.date.slice(8))),
    weekday: weekdayLabelOf(record.date, locale),
    ...(record.time === undefined ? {} : { time: record.time }),
    leadTag: record.tags[0],
    tags: record.tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    place: placeOf(record, locale),
    episodeCount: count,
    episodeCountLabel: count === 1 ? episodeCount.one : fillTemplate(episodeCount.other, { count }),
  };
}
