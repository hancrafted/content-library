import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode with a page: built at its URL, `noindex`, its overview card unlinked until publication. */
export const episodeMetadata = {
  slug: 'never-too-early-sales',
  status: 'upcoming',
  topic: 'economics',
  format: 'foundations',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
