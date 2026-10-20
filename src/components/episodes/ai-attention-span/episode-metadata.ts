import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode: a draft, upcoming until its video is live; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'ai-attention-span',
  status: 'upcoming',
  // Needs human: the Brief names no Topic; ai-enablement is the closest existing Topic.
  topic: 'ai-enablement',
  format: 'foundations',
  // Needs human: the Brief names no Tags; an empty list until Han picks them.
  tags: [],
} as const satisfies UpcomingEpisodeMetadata;
