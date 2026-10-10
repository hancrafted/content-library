import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode: this folder holds only its metadata until its Slides are written (#40). */
export const episodeMetadata = {
  slug: 'ai-code-review-in-ci',
  status: 'upcoming',
  topic: 'ai-collaboration',
  format: 'teardown',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
