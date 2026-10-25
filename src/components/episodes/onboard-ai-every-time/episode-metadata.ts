import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  type: 'standard',
  visibility: 'public',
  status: 'published',
  format: 'foundations',
  concepts: ['context-engineering', 'agentic-ai'],
  applyThemeFromConcept: 'context-engineering',
  publishedOn: '2026-10-20',
} as const satisfies PublishedEpisodeMetadata;
