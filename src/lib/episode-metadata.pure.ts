import type { Episode, PublishedEpisode } from '../content-store/schemas/episode.schema';
import type { TagId } from '../content-store/schemas/fields';
import { TAGS, type TagLook } from './episode-overview';
import type { EpisodeSlug } from './routes';
import { pageTreatment } from './visibility.pure';

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

function isPublished(episode: Episode): episode is PublishedEpisode {
  return episode.status === 'published';
}

/**
 * Whether the visibility predicate puts the Episode on the site's own lists. Its own-page row reads only the record's
 * facts, so an upcoming Episode with no page yet (a slug outside `EPISODE_SLUGS`) takes the row its page will have.
 */
function isListed(episode: Episode): boolean {
  return pageTreatment({ episode: episode.slug as EpisodeSlug }, episode).listed;
}

/**
 * The overview's order, listed Episodes only (an unlisted one lives only under its Event, design-ADR 0016): the
 * Featured Episodes as listed, then every other published one newest first (ties by slug), then the upcoming ones
 * in the order given. A Featured slug that names no published public Episode is skipped.
 */
export function overviewOrder(all: readonly Episode[], featured: readonly string[]): Episode[] {
  const episodes = all.filter(isListed);
  const published = episodes.filter(isPublished);
  const lead = featured.flatMap((slug) => published.filter((episode) => episode.slug === slug));
  const rest = published
    .filter((episode) => !lead.includes(episode))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug));
  return [...lead, ...rest, ...episodes.filter((episode) => !isPublished(episode))];
}
