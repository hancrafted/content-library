import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'maintaining-markdown-for-ai',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['markdown', 'context-engineering'],
  publishedOn: '2026-10-09',
  youtube: { en: 'YxCVw4bUbW0', de: 'YxCVw4bUbW0' },
} as const satisfies EpisodeInput;
