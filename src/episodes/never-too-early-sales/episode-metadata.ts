import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'never-too-early-sales',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['sales'],
  publishedOn: '2026-10-19',
  youtube: { en: 'lnr7T-IBHTw', de: 'lnr7T-IBHTw' },
} as const satisfies EpisodeInput;
