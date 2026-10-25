import { episodePublishedOn, episodeStatus } from '@/components/episodes/episode-repository';
import { findEpisode } from '@/components/episodes/registry';
import type { EpisodeStatus, IsoDate } from '@/lib/episode-metadata.pure';

/**
 * Whether an Episode's page is Published or Upcoming. It reads the Episode registry, a component-tier module, so it
 * cannot live in `src/lib` (FE-007 §2); `pageMetadata` and the sitemap take its answer as data.
 */
export function episodeSlugStatus(slug: string): EpisodeStatus {
  return episodeStatus(findEpisode(slug).slug);
}

/** An Episode's release date, for the sitemap and the page metadata; undefined while upcoming. */
export function episodeSlugPublishedOn(slug: string): IsoDate | undefined {
  return episodePublishedOn(findEpisode(slug).slug);
}
