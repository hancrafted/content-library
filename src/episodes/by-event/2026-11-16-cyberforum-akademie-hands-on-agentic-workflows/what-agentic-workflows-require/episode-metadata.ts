import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'what-agentic-workflows-require',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['agentic-workflow'],
  publishedOn: '2026-11-16',
} as const satisfies EpisodeInput;
