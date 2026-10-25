import { TAG_IDS, TAGS, type FormatId, type TagId, type TagLook } from './episode-overview';
import type { EpisodeSlug } from './routes';

/*
 * What an Episode declares about itself for the Episode overview, in its own
 * folder (`episodes/<slug>/episode-metadata.ts`), and how the overview orders
 * those declarations. Ids and dates only, no strings: titles and captions stay
 * Translation keys (FE-003). No React (FE-007 §3).
 */

/** An ISO calendar date, `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`;

interface SharedMetadata {
  readonly format: FormatId;
  /** Tag ids from the closed vocabulary, lead Tag first: it gives the Episode's card its icon and accent. */
  readonly tags: readonly [TagId, ...TagId[]];
}

/** An Episode that has a page: its slug is registered. */
export interface PublishedEpisodeMetadata extends SharedMetadata {
  readonly slug: EpisodeSlug;
  readonly status: 'published';
  readonly publishedOn: IsoDate;
}

/** An Episode announced but not written: a folder holding only its metadata, no page, so no link. */
export interface UpcomingEpisodeMetadata extends SharedMetadata {
  readonly slug: string;
  readonly status: 'upcoming';
}

export type EpisodeMetadata = PublishedEpisodeMetadata | UpcomingEpisodeMetadata;
export type EpisodeStatus = EpisodeMetadata['status'];

/** The Episode's lead Tag: its first, which fixes the look of its card. */
export function leadTagOf(episode: Pick<SharedMetadata, 'tags'>): TagId {
  return episode.tags[0];
}

/** The icon and accent an Episode's card draws, from its lead Tag. */
export function lookOf(episode: Pick<SharedMetadata, 'tags'>): TagLook {
  return TAGS[leadTagOf(episode)];
}

/** What is wrong with the Tags the given Episodes declare: one sentence per problem, none when they are sound. */
export function tagProblems(episodes: readonly { slug: string; tags: readonly string[] }[]): string[] {
  const known: readonly string[] = TAG_IDS;
  return episodes.flatMap(({ slug, tags }) => [
    ...(tags.length === 0 ? [`${slug}: has no Tag`] : []),
    ...tags.filter((tag) => !known.includes(tag)).map((tag) => `${slug}: unknown Tag ${tag}`),
    ...[...new Set(tags.filter((tag, at) => tags.indexOf(tag) !== at))].map(
      (tag) => `${slug}: lists the Tag ${tag} twice`,
    ),
  ]);
}

function isPublished(episode: EpisodeMetadata): episode is PublishedEpisodeMetadata {
  return episode.status === 'published';
}

/**
 * The overview's order: the Featured Episodes as listed, then every other
 * published one newest first (ties by slug), then the upcoming ones in the
 * order given. A Featured slug that names no published Episode is skipped.
 */
export function overviewOrder(episodes: readonly EpisodeMetadata[], featured: readonly string[]): EpisodeMetadata[] {
  const published = episodes.filter(isPublished);
  const lead = featured.flatMap((slug) => published.filter((episode) => episode.slug === slug));
  const rest = published
    .filter((episode) => !lead.includes(episode))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug));
  return [...lead, ...rest, ...episodes.filter((episode) => !isPublished(episode))];
}
