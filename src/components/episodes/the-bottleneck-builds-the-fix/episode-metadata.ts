import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode: this folder holds only its metadata until its Slides are written (#40). */
export const episodeMetadata = {
  slug: 'the-bottleneck-builds-the-fix',
  status: 'upcoming',
  topic: 'adoption',
  format: 'teardown',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
