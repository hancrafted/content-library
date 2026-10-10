import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are Translation keys (#40). */
export const episodeMetadata = {
  slug: 'amnesiac-freelancer',
  status: 'published',
  topic: 'ai-collaboration',
  format: 'foundations',
  tags: ['onboarding', 'context', 'memory', 'decisions-in-writing'],
  publishedOn: '2026-10-08',
} as const satisfies PublishedEpisodeMetadata;
