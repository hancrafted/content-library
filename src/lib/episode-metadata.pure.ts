import {
  CONCEPT_THEMES,
  type FormatId,
  type ListedEpisodeSlug,
  type ThemeLook,
  type TopConceptId,
} from './episode-overview';

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
  /** The top Concepts the Episode teaches, in the order its card names them. */
  readonly concepts: readonly [TopConceptId, ...TopConceptId[]];
  /** One of `concepts`: the top Concept whose icon and accent the Episode's card draws. */
  readonly applyThemeFromConcept: TopConceptId;
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

/** The icon and accent an Episode's card draws, from the top Concept it names in `applyThemeFromConcept`. */
export function lookOf(episode: Pick<SharedMetadata, 'applyThemeFromConcept'>): ThemeLook {
  return CONCEPT_THEMES[episode.applyThemeFromConcept];
}

/**
 * What is wrong with the Concepts the given Episodes declare, against the top Concepts the store holds: one
 * sentence per problem, none when they are sound.
 */
export function episodeConceptProblems(
  episodes: readonly { slug: string; concepts: readonly string[]; applyThemeFromConcept: string }[],
  topConcepts: readonly string[],
): string[] {
  return episodes.flatMap(({ slug, concepts, applyThemeFromConcept: theme }) => [
    ...(topConcepts.includes(theme)
      ? []
      : [`${slug}: applyThemeFromConcept names ${theme}, which is not one of the top Concepts`]),
    ...(concepts.includes(theme)
      ? []
      : [`${slug}: applyThemeFromConcept names ${theme}, which concepts does not list`]),
    ...concepts
      .filter((id) => !topConcepts.includes(id))
      .map((id) => `${slug}: concepts names ${id}, which is not one of the top Concepts`),
    ...[...new Set(concepts.filter((id, at) => concepts.indexOf(id) !== at))].map(
      (id) => `${slug}: lists the Concept ${id} twice`,
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
