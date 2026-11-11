import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** What the Episode browser shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'from-shared-understanding-to-shared-context',
  status: 'upcoming',
  visibility: 'public',
  format: 'foundations',
  tags: ['context-engineering'],
} as const satisfies EpisodeInput;
