import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { episodeRoute, hasPage } from '@/content-store/catalogue/record-routes';
import type { EpisodeStatus, PublishedEpisode, UpcomingEpisode } from '@/content-store/schemas/episode.schema';
import type { FormatId, TagId } from '@/content-store/schemas/fields';
import { leadTagOf } from '@/episodes/lib/episode-metadata.pure';
import { dateLabelOf } from '@/shared/lib/date-label.pure';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';

export interface Labelled<Id extends string> {
  readonly id: Id;
  readonly label: string;
}

export interface TagLabel extends Labelled<TagId> {
  readonly tooltip: string;
}

// decision: FE-006 §4
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
  readonly leadTag: Labelled<TagId>;
  readonly format: Labelled<FormatId>;
  readonly tags: readonly TagLabel[];
  readonly youtubeUrl?: string;
  readonly minutes?: number;
  readonly publishedOn?: string;
  readonly releaseDate?: string;
  readonly featuredRank: number | null;
}

export type ReadKey = (key: string) => string;

export type EpisodeCopy = Pick<EpisodeCard, 'title' | 'caption'>;

type Identified<E> = E & { readonly ref: EpisodeRef };

/**
 * The Episode a card draws, keyed on its status: a published one carries its
 * copy from the registry, so `tsc` refuses one without it; an upcoming one
 * reads its own from the Episode browser's Translation keys, unless it already has a page
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
  readonly youtubeId?: string;
  readonly featuredRank?: number;
  readonly linkDrafts?: boolean;
}

const OVERVIEW_KEYS = 'episodeBrowser';

function copyOf(entry: CardEntry, ctx: CardContext): EpisodeCopy {
  if (entry.copy) return { title: entry.copy.title, caption: entry.copy.caption };
  const base = `${OVERVIEW_KEYS}.upcoming.${entry.slug}`;
  return { title: ctx.read(`${base}.title`), caption: ctx.read(`${base}.caption`) };
}

function isDraftLinked(entry: CardEntry, linkDrafts?: boolean): boolean {
  return Boolean(linkDrafts && 'copy' in entry && entry.copy !== undefined);
}

function videoOf(entry: CardEntry, youtubeId?: string): Pick<EpisodeCard, 'youtubeUrl'> {
  if (entry.status !== 'published' || youtubeId === undefined) return {};
  return { youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}` };
}

function releaseFields(entry: CardEntry, locale: Locale): Pick<EpisodeCard, 'publishedOn' | 'releaseDate'> {
  if (entry.status !== 'published') return {};
  return { publishedOn: entry.publishedOn, releaseDate: dateLabelOf(entry.publishedOn, locale) };
}

function publishedFields(entry: CardEntry, ctx: CardContext): Partial<EpisodeCard> {
  const isLinked = entry.status === 'published' || isDraftLinked(entry, ctx.linkDrafts);
  if (!isLinked || !hasPage(entry.ref)) return {};
  const route = episodeRoute(entry.ref.id);
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
    label: read(`tags.${id}.name`),
    tooltip: read(`tags.${id}.tooltip`),
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
    ...publishedFields(entry, ctx),
  };
}
