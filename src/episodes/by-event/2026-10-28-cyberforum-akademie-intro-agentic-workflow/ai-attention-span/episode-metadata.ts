import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'ai-attention-span',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-workflow'],
  publishedOn: '2026-10-28',
  youtube: { id: 'atPa8aTd-PQ', language: 'de' },
} as const satisfies EpisodeInput;
