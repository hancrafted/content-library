import { eventRoute, type EventSlug } from '@/content-store/catalogue/record-routes';
import type { Event } from '@/content-store/schemas/event.schema';
import type { EventFormat, IsoDate, TagId } from '@/content-store/schemas/fields';
import { dateLabelOf, weekdayLabelOf } from '@/shared/lib/date-label.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { EVENT_WORDS, eventCopy } from './event-words';

export interface TagWords {
  readonly name: string;
  readonly tooltip: string;
}

// decision: FE-007 §2.4
export type TagWordMap = Readonly<Record<TagId, TagWords>>;

export interface EventTag {
  readonly id: TagId;
  readonly label: string;
  readonly tooltip: string;
}

export interface EventPlace {
  readonly format: EventFormat;
  readonly label: string;
}

// decision: FE-006 §4
export interface EventCard {
  readonly slug: string;
  readonly route: string;
  readonly title: string;
  readonly description: string;
  readonly date: IsoDate;
  readonly dateLabel: string;
  readonly day: string;
  readonly weekday: string;
  readonly time?: string;
  readonly leadTag: TagId;
  readonly tags: readonly EventTag[];
  readonly place: EventPlace;
  readonly episodeCount: number;
  readonly episodeCountLabel: string;
}

type CardEvent = Pick<Event, 'date' | 'time' | 'tags' | 'format' | 'venue' | 'platform'> & {
  readonly slug: EventSlug;
  readonly playlist: { readonly episodes: readonly { readonly episode: { readonly slug: string } }[] };
};

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

export function eventCard(record: CardEvent, locale: Locale, tagWords: TagWordMap): EventCard {
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
