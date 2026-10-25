import { episodePublishedOn, episodeStatus } from '@/components/episodes/episode-repository';
import { findEpisode } from '@/components/episodes/registry';
import type { EpisodeStatus, IsoDate } from '@/lib/episode-metadata.pure';
import { isAnyEpisodeSlug } from '@/lib/routes';

/**
 * Whether an Episode's page is Published or Upcoming. It reads the Episode registry, a component-tier module, so it
 * cannot live in `src/lib` (FE-007 §2). A tooling page is no Episode and has no status, so it throws.
 */
export function episodeSlugStatus(slug: string): EpisodeStatus {
  const own = findEpisode(slug).slug;
  if (!isAnyEpisodeSlug(own)) throw new Error(`"${own}" is a tooling page: it has no status`);
  return episodeStatus(own);
}

/** An Episode's release date, for the sitemap and the page metadata; undefined while upcoming, for a layout reference or a tooling page. */
export function episodeSlugPublishedOn(slug: string): IsoDate | undefined {
  return episodePublishedOn(findEpisode(slug).slug);
}
