import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'ai-attention-span',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-workflow'],
  publishedOn: '2026-10-21',
} as const satisfies EpisodeInput;
