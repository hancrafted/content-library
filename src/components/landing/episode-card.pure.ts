import {
  type Accent,
  type EpisodeIcon,
  type EpisodeIndexEntry,
  type EpisodeStatus,
  type FormatId,
  type TopicId,
} from '@/lib/episode-index.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';

/** One id with its label in the reader's locale. */
export interface Labelled<Id extends string> {
  readonly id: Id;
  readonly label: string;
}

/**
 * One Episode as a landing design draws it: the index entry with its strings
 * read in one locale. Plain values only, so a Server Component can hand it to a
 * `*.client.tsx` leaf (FE-006 §4).
 */
export interface EpisodeCard {
  readonly slug: string;
  /**
   * The Episode's locale-neutral logical path; `null` while it is only announced.
   * A JSX `href` must be `{localizePath(card.route, locale)}` (FE-003), so a leaf
   * that draws a link reads this, not `href`.
   */
  readonly route: string | null;
  /** The same link already localized, for what is not a JSX `href`: a data attribute, `router.push`. */
  readonly href: string | null;
  readonly status: EpisodeStatus;
  readonly title: string;
  readonly caption: string;
  readonly topic: Labelled<TopicId>;
  readonly format: Labelled<FormatId>;
  /** Reading time in this locale; left off when the Episode's record was not read. */
  readonly minutes?: number;
  readonly publishedOn?: string;
  /** Editorial order among published Episodes, 1 first; `null` for an upcoming one. */
  readonly featuredRank: number | null;
  readonly accent: Accent;
  readonly icon: EpisodeIcon;
}

/** Reads one Translation key by its full dotted path. */
export type ReadKey = (key: string) => string;

export interface CardContext {
  readonly locale: Locale;
  readonly read: ReadKey;
  readonly minutes?: number;
}

const INDEX_KEYS = 'landing.episodeIndex';

function copyOf(entry: EpisodeIndexEntry, read: ReadKey): Pick<EpisodeCard, 'title' | 'caption'> {
  const base = entry.status === 'published' ? `episodes.${entry.slug}` : `${INDEX_KEYS}.upcoming.${entry.slug}`;
  return { title: read(`${base}.title`), caption: read(`${base}.caption`) };
}

function publishedFields(entry: EpisodeIndexEntry, ctx: CardContext): Partial<EpisodeCard> {
  if (entry.status !== 'published') return {};
  const minutes = ctx.minutes === undefined ? {} : { minutes: ctx.minutes };
  const route = episodeRoute(entry.slug);
  return { route, href: localizePath(route, ctx.locale), publishedOn: entry.publishedOn, ...minutes };
}

/** Assembles one card; throws when a string it needs is missing, so the build fails rather than ships a blank. */
export function episodeCard(entry: EpisodeIndexEntry, ctx: CardContext): EpisodeCard {
  const { read } = ctx;
  return {
    slug: entry.slug,
    route: null,
    href: null,
    status: entry.status,
    ...copyOf(entry, read),
    topic: { id: entry.topic, label: read(`${INDEX_KEYS}.topics.${entry.topic}`) },
    format: { id: entry.format, label: read(`${INDEX_KEYS}.formats.${entry.format}`) },
    featuredRank: entry.status === 'published' ? entry.featuredRank : null,
    accent: entry.accent,
    icon: entry.icon,
    ...publishedFields(entry, ctx),
  };
}
