import {
  topicsOf,
  type EpisodeStatus,
  type PublishedEpisodeMetadata,
  type UpcomingEpisodeMetadata,
} from '@/lib/episode-metadata.pure';
import { TOPICS, type Accent, type FormatId, type TopicIcon, type TopicId } from '@/lib/episode-overview';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, isEpisodeSlug } from '@/lib/routes';

/** One id with its label in the reader's locale. */
export interface Labelled<Id extends string> {
  readonly id: Id;
  readonly label: string;
}

/** One Tag as a card draws it: its name and the tooltip that explains it, both in the reader's locale. */
export interface TagLabel extends Labelled<string> {
  readonly tooltip: string;
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
  /** The Episode's Tags in its own order; a flat list, none ranks above another. */
  readonly tags: readonly TagLabel[];
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

/**
 * The Episode a card draws, keyed on its status: a published one carries its
 * copy from the registry, so `tsc` refuses one without it; an upcoming one
 * reads its own from the landing Translation keys, unless it already has a page
 * and so its own `i18n/` (`copy`), which it then carries as a published one does.
 */
export type CardEntry =
  | (PublishedEpisodeMetadata & { readonly copy: EpisodeCopy })
  | (UpcomingEpisodeMetadata & { readonly copy?: EpisodeCopy });

export interface CardContext {
  readonly locale: Locale;
  readonly read: ReadKey;
  readonly minutes?: number;
  /** The Episode's Featured slot, 1 first; left off when it is not Featured. */
  readonly featuredRank?: number;
  /** When true, upcoming Episodes with a page get a link (e.g. in dev mode GUI). */
  readonly linkDrafts?: boolean;
}

const OVERVIEW_KEYS = 'landing.episodeOverview';

function copyOf(entry: CardEntry, ctx: CardContext): EpisodeCopy {
  if (entry.copy) return { title: entry.copy.title, caption: entry.copy.caption };
  const base = `${OVERVIEW_KEYS}.upcoming.${entry.slug}`;
  return { title: ctx.read(`${base}.title`), caption: ctx.read(`${base}.caption`) };
}

function isDraftLinked(entry: CardEntry, linkDrafts?: boolean): boolean {
  return Boolean(linkDrafts && 'copy' in entry && entry.copy !== undefined);
}

function publishedFields(entry: CardEntry, ctx: CardContext): Partial<EpisodeCard> {
  const isLinked = entry.status === 'published' || isDraftLinked(entry, ctx.linkDrafts);
  if (!isLinked || !isEpisodeSlug(entry.slug)) return {};
  const route = episodeRoute(entry.slug);
  return {
    route,
    href: localizePath(route, ctx.locale),
    publishedOn: entry.status === 'published' ? entry.publishedOn : undefined,
    featuredRank: ctx.featuredRank ?? null,
    ...(ctx.minutes !== undefined ? { minutes: ctx.minutes } : {}),
  };
}

/** Assembles one card; throws when a string it needs is missing, so the build fails rather than ships a blank. */
export function episodeCard(entry: CardEntry, ctx: CardContext): EpisodeCard {
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
    tags: entry.tags.map((id) => ({
      id,
      label: read(`${OVERVIEW_KEYS}.tags.${id}.name`),
      tooltip: read(`${OVERVIEW_KEYS}.tags.${id}.tooltip`),
    })),
    featuredRank: null,
    ...TOPICS[entry.topic],
    ...publishedFields(entry, ctx),
  };
}
