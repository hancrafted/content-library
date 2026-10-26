import type { EpisodeStatus, PublishedEpisode, UpcomingEpisode } from '@/content-store/schemas/episode.schema';
import type { FormatId, IsoDate, TagId } from '@/content-store/schemas/fields';
import { leadTagOf, lookOf } from '@/episodes/lib/episode-metadata.pure';
import type { Accent, TagIcon } from '@/lib/episode-overview';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, isEpisodeId } from '@/lib/routes';

/** One id with its label in the reader's locale. */
export interface Labelled<Id extends string> {
  readonly id: Id;
  readonly label: string;
}

/** One Tag as a card draws it: its name and the tooltip that explains it, both in the reader's locale. */
export interface TagLabel extends Labelled<TagId> {
  readonly tooltip: string;
}

/**
 * One Episode as a landing design draws it: the Episode's metadata with its
 * strings read in one locale and its look taken from its lead Tag. Plain
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
  /** The Episode's first Tag, which the card names and draws its icon and accent from. */
  readonly leadTag: Labelled<TagId>;
  readonly format: Labelled<FormatId>;
  /** The Episode's Tags in its own order, lead Tag first. */
  readonly tags: readonly TagLabel[];
  /** The Episode's video in this locale; left off when it has none or is not published. */
  readonly youtubeUrl?: string;
  /** Reading time in this locale; left off when the Episode's record was not read. */
  readonly minutes?: number;
  readonly publishedOn?: string;
  /** `publishedOn` as the reader's locale writes it ("Oct 20, 2026", "20. Okt. 2026"); left off when it is not published. */
  readonly releaseDate?: string;
  /** Position in the Featured slots, 1 first; `null` for every other card. */
  readonly featuredRank: number | null;
  readonly accent: Accent;
  readonly icon: TagIcon;
}

/** Reads one Translation key by its full dotted path. */
export type ReadKey = (key: string) => string;

/** A published Episode's own title and caption, read through the registry from its record. */
export type EpisodeCopy = Pick<EpisodeCard, 'title' | 'caption'>;

/** An Episode's record with the Episode id its folder gives it, as the content store serves it. */
type Identified<E> = E & { readonly id: string };

/**
 * The Episode a card draws, keyed on its status: a published one carries its
 * copy from the registry, so `tsc` refuses one without it; an upcoming one
 * reads its own from the landing Translation keys, unless it already has a page
 * and so its own `i18n/` (`copy`), which it then carries as a published one does.
 * Its page is looked up by its Episode id, so an Event's copy never opens its original.
 */
export type CardEntry =
  | Identified<PublishedEpisode & { readonly copy: EpisodeCopy }>
  | Identified<UpcomingEpisode & { readonly copy?: EpisodeCopy }>;

export interface CardContext {
  readonly locale: Locale;
  readonly read: ReadKey;
  readonly minutes?: number;
  /** The Episode's YouTube video id in this locale; left off when it has none. */
  readonly youtubeId?: string;
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

/** A published Episode's video link; an upcoming one has no public video yet. */
function videoOf(entry: CardEntry, youtubeId?: string): Pick<EpisodeCard, 'youtubeUrl'> {
  if (entry.status !== 'published' || youtubeId === undefined) return {};
  return { youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}` };
}

/** The release day as the locale writes it, read in UTC so the calendar day never shifts with the build machine's time zone. */
export function releaseDateOf(publishedOn: IsoDate, locale: Locale): string {
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return format.format(new Date(`${publishedOn}T00:00:00Z`));
}

function releaseFields(entry: CardEntry, locale: Locale): Pick<EpisodeCard, 'publishedOn' | 'releaseDate'> {
  if (entry.status !== 'published') return {};
  return { publishedOn: entry.publishedOn, releaseDate: releaseDateOf(entry.publishedOn, locale) };
}

function publishedFields(entry: CardEntry, ctx: CardContext): Partial<EpisodeCard> {
  const isLinked = entry.status === 'published' || isDraftLinked(entry, ctx.linkDrafts);
  if (!isLinked || !isEpisodeId(entry.id)) return {};
  const route = episodeRoute(entry.id);
  return {
    route,
    href: localizePath(route, ctx.locale),
    ...releaseFields(entry, ctx.locale),
    featuredRank: ctx.featuredRank ?? null,
    ...(ctx.minutes !== undefined ? { minutes: ctx.minutes } : {}),
    ...videoOf(entry, ctx.youtubeId),
  };
}

/** Assembles one card; throws when a string it needs is missing, so the build fails rather than ships a blank. */
export function episodeCard(entry: CardEntry, ctx: CardContext): EpisodeCard {
  const { read } = ctx;
  const copy = copyOf(entry, ctx);
  const tags = entry.tags.map((id) => ({
    id,
    label: read(`${OVERVIEW_KEYS}.tags.${id}.name`),
    tooltip: read(`${OVERVIEW_KEYS}.tags.${id}.tooltip`),
  }));
  return {
    slug: entry.slug,
    route: null,
    href: null,
    status: entry.status,
    ...copy,
    leadTag: { id: leadTagOf(entry), label: tags[0].label },
    format: { id: entry.format, label: read(`${OVERVIEW_KEYS}.formats.${entry.format}`) },
    tags,
    featuredRank: null,
    ...lookOf(entry),
    ...publishedFields(entry, ctx),
  };
}
