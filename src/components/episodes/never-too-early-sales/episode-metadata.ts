import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; upcoming until its video is published, so no `publishedOn`. */
export const episodeMetadata = {
  slug: 'never-too-early-sales',
  status: 'upcoming',
  topic: 'economics',
  format: 'foundations',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
