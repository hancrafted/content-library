import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode: upcoming until its video is live; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'never-too-early-sales-run-2',
  status: 'upcoming',
  topic: 'economics',
  format: 'foundations',
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
