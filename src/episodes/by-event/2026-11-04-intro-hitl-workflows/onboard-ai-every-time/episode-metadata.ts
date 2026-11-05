import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** An unlisted Episode presented at Intro HITL Workflows. */
export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-11-04',
} as const satisfies EpisodeInput;
