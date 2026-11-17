import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import type { Episode, PublishedEpisode } from '@/content-store/schemas/episode.schema';
import type { TagId } from '@/content-store/schemas/fields';

// decision: FE-007 §3
export function leadTagOf(episode: Pick<Episode, 'tags'>): TagId {
  return episode.tags[0];
}

function isPublished<E extends Episode>(episode: E): episode is E & PublishedEpisode {
  return episode.status === 'published';
}

// decision: docs/decision-records/0016-content-data-model.md
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
