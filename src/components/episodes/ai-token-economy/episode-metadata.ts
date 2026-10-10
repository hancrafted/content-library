import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are Translation keys (#40). */
export const episodeMetadata = {
  slug: 'ai-token-economy',
  status: 'published',
  topic: 'economics',
  format: 'foundations',
  tags: ['tokens', 'context-window', 'agentic-ai', 'model-tiers'],
  publishedOn: '2026-10-09',
} as const satisfies PublishedEpisodeMetadata;
