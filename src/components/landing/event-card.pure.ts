import type { IsoDate } from '@/content-store/schemas/fields';
import type { ServedEvent } from '@/content-store/store';
import { releaseDateOf, type ReadKey } from '@/episodes/components/episode-card/episode-card.pure';
import type { Locale } from '@/lib/locale.pure';
import { eventRoute } from '@/lib/routes';
import { fillTemplate } from '@/lib/template.pure';

/** What an Event card reads from the Translation file: any key by its full path, and the Episode count's two sentences. */
export interface EventReads {
  readonly read: ReadKey;
  readonly episodeCount: { readonly one: string; readonly other: string };
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
  readonly time?: string;
  readonly location?: string;
  readonly episodeCount: number;
  /** "3 Episodes" in the reader's locale. */
  readonly episodeCountLabel: string;
}

const ITEMS = 'eventsPage.items';

/** What a card reads of an Event the store serves: its slug, its day and time, its place, and its Playlist's length. */
type CardEvent = Pick<ServedEvent, 'slug' | 'date' | 'time' | 'location'> & {
  readonly playlist: { readonly episodes: readonly unknown[] };
};

/** Assembles one card; throws when a string it needs is missing, so the build fails rather than ships a blank. */
export function eventCard(record: CardEvent, locale: Locale, { read, episodeCount }: EventReads): EventCard {
  const count = record.playlist.episodes.length;
  return {
    slug: record.slug,
    route: eventRoute(record.slug),
    title: read(`${ITEMS}.${record.slug}.title`),
    description: read(`${ITEMS}.${record.slug}.description`),
    date: record.date,
    dateLabel: releaseDateOf(record.date, locale),
    ...(record.time === undefined ? {} : { time: record.time }),
    ...(record.location === undefined ? {} : { location: record.location }),
    episodeCount: count,
    episodeCountLabel: count === 1 ? episodeCount.one : fillTemplate(episodeCount.other, { count }),
  };
}
