import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** The event-frame Episode of the AXEL seminar: always unlisted, always published; its Event's date says when. */
export const episodeMetadata = {
  slug: 'axel-agentic-workflow-agenda',
  type: 'event-frame',
  visibility: 'unlisted',
  status: 'published',
  format: 'short',
  concepts: ['agentic-ai'],
  applyThemeFromConcept: 'agentic-ai',
  publishedOn: '2026-10-23',
} as const satisfies PublishedEpisodeMetadata;
