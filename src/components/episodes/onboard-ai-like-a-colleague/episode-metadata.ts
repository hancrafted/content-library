import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are Translation keys (#40). */
export const episodeMetadata = {
  slug: 'onboard-ai-like-a-colleague',
  status: 'published',
  topic: 'ai-collaboration',
  extraTopics: ['adoption'],
  format: 'foundations',
  tags: ['onboarding', 'delegation', 'context', 'productivity'],
  publishedOn: '2026-10-13',
} as const satisfies PublishedEpisodeMetadata;
