import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** An unlisted Episode presented at Intro HITL Workflows. */
export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['agentic-ai', 'workflow'],
  publishedOn: '2026-11-04',
} as const satisfies EpisodeInput;
