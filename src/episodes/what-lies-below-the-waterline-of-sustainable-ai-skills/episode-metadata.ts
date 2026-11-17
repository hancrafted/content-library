import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering'],
  publishedOn: '2026-11-15',
} as const satisfies EpisodeInput;
