import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** What the Episode browser shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'what-agentic-workflows-require',
  status: 'upcoming',
  visibility: 'public',
  format: 'foundations',
  // Needs human: the Brief names no Tag; agentic-workflow is the nearest existing one.
  tags: ['agentic-workflow'],
} as const satisfies EpisodeInput;
