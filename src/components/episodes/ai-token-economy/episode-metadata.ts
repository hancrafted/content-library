import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are Translation keys (#40). */
export const episodeMetadata = {
  slug: 'ai-token-economy',
  status: 'published',
  format: 'foundations',
  concepts: ['ai-cost', 'agentic-ai'],
  applyThemeFromConcept: 'ai-cost',
  publishedOn: '2026-10-09',
} as const satisfies PublishedEpisodeMetadata;
