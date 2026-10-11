import { topicsOf, type EpisodeMetadata, type EpisodeStatus } from '@/lib/episode-metadata.pure';
import { TOPICS, type Accent, type FormatId, type TopicIcon, type TopicId } from '@/lib/episode-overview';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';

/** One id with its label in the reader's locale. */
export interface Labelled<Id extends string> {
  readonly id: Id;
  readonly label: string;
}

/**
 * One Episode as a landing design draws it: the Episode's metadata with its
 * strings read in one locale and its look taken from its primary Topic. Plain
 * values only, so a Server Component can hand it to a `*.client.tsx` leaf
 * (FE-006 §4).
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
  /** The primary Topic, which the card names and draws its look from. */
  readonly topic: Labelled<TopicId>;
  /** Every Topic the Episode appears under, primary first: what a Topic filter matches. */
  readonly topics: readonly Labelled<TopicId>[];
  readonly format: Labelled<FormatId>;
  /** Reading time in this locale; left off when the Episode's record was not read. */
  readonly minutes?: number;
  readonly publishedOn?: string;
  /** Position in the Featured slots, 1 first; `null` for every other card. */
  readonly featuredRank: number | null;
  readonly accent: Accent;
  readonly icon: TopicIcon;
}

/** Reads one Translation key by its full dotted path. */
export type ReadKey = (key: string) => string;

/** A published Episode's own title and caption, read through the registry from its record. */
export type EpisodeCopy = Pick<EpisodeCard, 'title' | 'caption'>;

export interface CardContext {
  readonly locale: Locale;
  readonly read: ReadKey;
  /** A published Episode's copy; an upcoming one reads its own from the landing Translation keys. */
  readonly copy?: EpisodeCopy;
  readonly minutes?: number;
  /** The Episode's Featured slot, 1 first; left off when it is not Featured. */
  readonly featuredRank?: number;
}

const OVERVIEW_KEYS = 'landing.episodeOverview';

function copyOf(entry: EpisodeMetadata, ctx: CardContext): EpisodeCopy {
  if (entry.status === 'published') {
    if (ctx.copy === undefined) throw new Error(`Published Episode "${entry.slug}" needs its copy from the registry.`);
    return { title: ctx.copy.title, caption: ctx.copy.caption };
  }
  const base = `${OVERVIEW_KEYS}.upcoming.${entry.slug}`;
  return { title: ctx.read(`${base}.title`), caption: ctx.read(`${base}.caption`) };
}

function publishedFields(entry: EpisodeMetadata, ctx: CardContext): Partial<EpisodeCard> {
  if (entry.status !== 'published') return {};
  const minutes = ctx.minutes === undefined ? {} : { minutes: ctx.minutes };
  const route = episodeRoute(entry.slug);
  return {
    route,
    href: localizePath(route, ctx.locale),
    publishedOn: entry.publishedOn,
    featuredRank: ctx.featuredRank ?? null,
    ...minutes,
  };
}

/** Assembles one card; throws when a string it needs is missing, so the build fails rather than ships a blank. */
export function episodeCard(entry: EpisodeMetadata, ctx: CardContext): EpisodeCard {
  const { read } = ctx;
  const copy = copyOf(entry, ctx);
  const topics = topicsOf(entry).map((id) => ({ id, label: read(`${OVERVIEW_KEYS}.topics.${id}`) }));
  return {
    slug: entry.slug,
    route: null,
    href: null,
    status: entry.status,
    ...copy,
    topic: topics[0],
    topics,
    format: { id: entry.format, label: read(`${OVERVIEW_KEYS}.formats.${entry.format}`) },
    featuredRank: null,
    ...TOPICS[entry.topic],
    ...publishedFields(entry, ctx),
  };
}
