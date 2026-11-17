import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-10-21',
} as const satisfies EpisodeInput;
