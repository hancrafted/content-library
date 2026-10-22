import type { IsoDate } from '@/lib/episode-metadata.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { workshopRoute } from '@/lib/routes';
import { fillTemplate } from '@/lib/template.pure';
import type { WorkshopRecord } from '@/lib/workshops.pure';
import { releaseDateOf, type ReadKey } from './episode-card.pure';

/** What a Workshop card reads from the Translation file: any key by its full path, and the Episode count's two sentences. */
export interface WorkshopReads {
  readonly read: ReadKey;
  readonly episodeCount: { readonly one: string; readonly other: string };
}

/**
 * One Workshop as its card draws it: the record with its strings read in one locale. Plain values
 * only, so a Server Component can hand it on (FE-006 §4).
 */
export interface WorkshopCard {
  readonly slug: string;
  /** The Workshop's locale-neutral logical path; a JSX `href` must be `localizePath(route, locale)` (FE-003). */
  readonly route: string;
  readonly href: string;
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

const ITEMS = 'workshopsPage.items';

/** Assembles one card; throws when a string it needs is missing, so the build fails rather than ships a blank. */
export function workshopCard(
  record: WorkshopRecord,
  locale: Locale,
  { read, episodeCount }: WorkshopReads,
): WorkshopCard {
  const count = record.episodes.length;
  const route = workshopRoute(record.slug);
  return {
    slug: record.slug,
    route,
    href: localizePath(route, locale),
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
