import type { UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode: a draft, upcoming until its video is live; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'ai-attention-span',
  status: 'upcoming',
  // Han: context engineering, part of AI enablement; Topics have no sub-Topics, so it is a Tag.
  topic: 'ai-enablement',
  format: 'foundations',
  tags: ['context-engineering', 'workflow', 'context-window'],
} as const satisfies UpcomingEpisodeMetadata;
