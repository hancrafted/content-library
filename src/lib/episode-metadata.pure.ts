import type { FormatId, ListedEpisodeSlug, TopicId, TopicLook } from './episode-overview';

/*
 * What an Episode declares about itself for the Episode overview, in its own
 * folder (`episodes/<slug>/episode-metadata.ts`), and how the overview orders
 * those declarations. Ids and dates only, no strings: titles and captions stay
 * Translation keys (FE-003). No React (FE-007 §3).
 */

/** An ISO calendar date, `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`;

interface SharedMetadata {
  /** The Topic that gives the Episode its icon and colour. */
  readonly topic: TopicId;
  /** Further Topics (playlists) the Episode also appears in. */
  readonly extraTopics?: readonly TopicId[];
  /** Overrides the Topic's accent and icon on this Episode's card; the Topic chip and filter stay as they are. */
  readonly look?: Partial<TopicLook>;
  readonly format: FormatId;
  /** Tag ids, kebab-case, flat and unranked; each is named and explained by id in the landing Translation keys. */
  readonly tags: readonly string[];
}

/** An Episode that has a page: its slug is registered. */
export interface PublishedEpisodeMetadata extends SharedMetadata {
  readonly slug: ListedEpisodeSlug;
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

/** Every Topic an Episode appears under: its primary Topic first, then its extra ones, each once. */
export function topicsOf(episode: EpisodeMetadata): readonly TopicId[] {
  return [...new Set([episode.topic, ...(episode.extraTopics ?? [])])];
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
