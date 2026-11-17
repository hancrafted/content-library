import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'from-shared-understanding-to-shared-context',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering'],
  publishedOn: '2026-11-11',
  youtube: { en: 'ybDzHMJ_1e0', de: 'ybDzHMJ_1e0' },
} as const satisfies EpisodeInput;
