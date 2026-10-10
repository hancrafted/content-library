import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode: this folder holds only its metadata until its Slides are written (#40). */
export const episodeMetadata = {
  slug: 'choosing-the-right-model',
  status: 'upcoming',
  topic: 'economics',
  format: 'short',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
