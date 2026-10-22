import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-ai', 'workflow'],
  publishedOn: '2026-10-20',
} as const satisfies PublishedEpisodeMetadata;
