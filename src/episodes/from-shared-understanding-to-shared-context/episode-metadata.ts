import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'from-shared-understanding-to-shared-context',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering'],
  publishedOn: '2026-11-11',
} as const satisfies EpisodeInput;
