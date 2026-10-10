import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** An Upcoming Episode: this folder holds only its metadata until its Slides are written (#40). */
export const episodeMetadata = {
  slug: 'specs-an-agent-can-follow',
  status: 'upcoming',
  topic: 'ai-collaboration',
  format: 'foundations',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
