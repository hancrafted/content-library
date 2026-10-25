import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  type: 'standard',
  visibility: 'public',
  status: 'published',
  format: 'foundations',
  concepts: ['agentic-ai', 'ai-adoption'],
  applyThemeFromConcept: 'agentic-ai',
  publishedOn: '2026-10-21',
} as const satisfies PublishedEpisodeMetadata;
