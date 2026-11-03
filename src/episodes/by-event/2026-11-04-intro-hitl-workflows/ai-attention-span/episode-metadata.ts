import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** An unlisted Episode presented at Intro HITL Workflows. */
export const episodeMetadata = {
  slug: 'ai-attention-span',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'workflow'],
  publishedOn: '2026-11-04',
} as const satisfies EpisodeInput;
