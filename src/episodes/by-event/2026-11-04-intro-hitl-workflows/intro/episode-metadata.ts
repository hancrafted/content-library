import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

export const episodeMetadata = {
  slug: 'intro',
  status: 'published',
  visibility: 'unlisted',
  format: 'short',
  tags: ['overview', 'agentic-workflow', 'agentic-ai'],
  publishedOn: '2026-11-04',
} as const satisfies EpisodeInput;
