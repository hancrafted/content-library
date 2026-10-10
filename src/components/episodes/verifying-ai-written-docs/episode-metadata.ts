import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode: this folder holds only its metadata until its Slides are written (#40). */
export const episodeMetadata = {
  slug: 'verifying-ai-written-docs',
  status: 'upcoming',
  topic: 'documentation',
  format: 'short',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
