import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['agentic-ai', 'workflow'],
  publishedOn: '2026-10-21',
} as const satisfies EpisodeInput;
