import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'ai-token-economy',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['cost', 'agentic-ai'],
  publishedOn: '2026-10-09',
  youtube: { en: 'S0Nx4faEebY', de: 'S0Nx4faEebY' },
} as const satisfies EpisodeInput;
