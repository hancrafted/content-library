import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-11-04',
} as const satisfies EpisodeInput;
