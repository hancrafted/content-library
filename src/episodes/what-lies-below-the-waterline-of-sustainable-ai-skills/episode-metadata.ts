import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** What the Episode browser shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  status: 'upcoming',
  visibility: 'public',
  format: 'foundations',
  // needs-human: the Brief names no Tag; context-engineering is the nearest one in the closed vocabulary.
  tags: ['context-engineering'],
} as const satisfies EpisodeInput;
