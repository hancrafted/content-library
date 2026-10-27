import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import type { Episode, PublishedEpisode } from '@/content-store/schemas/episode.schema';
import type { TagId } from '@/content-store/schemas/fields';

/*
 * How the Episode browser reads what an Episode declares about itself: its lead Tag, which gives its card's look,
 * and the browser's order. The record and its type live in the content store's schema (FE-013); values arrive as
 * arguments. No React (FE-007 §3).
 */

/** The Episode's lead Tag: its first, which fixes the look of its card. */
export function leadTagOf(episode: Pick<Episode, 'tags'>): TagId {
  return episode.tags[0];
}

function isPublished<E extends Episode>(episode: E): episode is E & PublishedEpisode {
  return episode.status === 'published';
}

/**
 * The browser's order of the Episodes the site's own lists show (`listedEpisodes` of the page catalogue: never an
 * unlisted one, design-ADR 0016): the Featured Episodes as listed, then every other published one newest first (ties
 * by Episode id), then the upcoming ones in the order given. Featured names Episodes by id, since an Event's copy
 * shares its original's slug; one that names no published Episode is skipped.
 */
export function overviewOrder<E extends Episode & { readonly ref: EpisodeRef }>(
  episodes: readonly E[],
  featured: readonly string[],
): E[] {
  const published = episodes.filter(isPublished);
  const lead = featured.flatMap((id) => published.filter(({ ref }) => ref.id === id));
  const rest = published
    .filter((episode) => !lead.includes(episode))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.ref.id.localeCompare(b.ref.id));
  return [...lead, ...rest, ...episodes.filter((episode) => !isPublished(episode))];
}
