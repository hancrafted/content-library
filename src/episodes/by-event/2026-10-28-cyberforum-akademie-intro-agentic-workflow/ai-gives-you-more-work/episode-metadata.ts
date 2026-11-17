import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-10-28',
  youtube: { id: 'gNTzDjc9Jwc', language: 'de' },
} as const satisfies EpisodeInput;
