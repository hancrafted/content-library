import type { Episode, PublishedEpisode } from '../content-store/schemas/episode.schema';
import type { TagId } from '../content-store/schemas/fields';
import { TAGS, type TagLook } from './episode-overview';

/*
 * How the Episode overview reads what an Episode declares about itself: its lead Tag, its card's look and the
 * overview's order. The record and its type live in the content store's schema (FE-013); values arrive as
 * arguments. No React (FE-007 §3).
 */

/** The Episode's lead Tag: its first, which fixes the look of its card. */
export function leadTagOf(episode: Pick<Episode, 'tags'>): TagId {
  return episode.tags[0];
}

/** The icon and accent an Episode's card draws, from its lead Tag. */
export function lookOf(episode: Pick<Episode, 'tags'>): TagLook {
  return TAGS[leadTagOf(episode)];
}

function isPublished<E extends Episode>(episode: E): episode is E & PublishedEpisode {
  return episode.status === 'published';
}

/**
 * The overview's order of the Episodes the site's own lists show (`listedEpisodes` of the page catalogue: never an
 * unlisted one, design-ADR 0016): the Featured Episodes as listed, then every other published one newest first (ties
 * by slug), then the upcoming ones in the order given. A Featured slug that names no published Episode is skipped.
 */
export function overviewOrder<E extends Episode>(episodes: readonly E[], featured: readonly string[]): E[] {
  const published = episodes.filter(isPublished);
  const lead = featured.flatMap((slug) => published.filter((episode) => episode.slug === slug));
  const rest = published
    .filter((episode) => !lead.includes(episode))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug));
  return [...lead, ...rest, ...episodes.filter((episode) => !isPublished(episode))];
}
