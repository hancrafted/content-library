import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-10-20',
} as const satisfies EpisodeInput;
