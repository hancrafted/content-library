import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-10-23',
  youtube: { id: '0nB6wp9i6PI', language: 'en' },
} as const satisfies EpisodeInput;
