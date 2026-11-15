import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** What the Episode browser shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering'],
  publishedOn: '2026-11-15',
} as const satisfies EpisodeInput;
