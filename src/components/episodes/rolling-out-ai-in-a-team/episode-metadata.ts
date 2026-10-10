import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode: this folder holds only its metadata until its Slides are written (#40). */
export const episodeMetadata = {
  slug: 'rolling-out-ai-in-a-team',
  status: 'upcoming',
  topic: 'adoption',
  format: 'foundations',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
