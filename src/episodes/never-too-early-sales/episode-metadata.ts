import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** What the Episode browser shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'never-too-early-sales',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['sales'],
  publishedOn: '2026-10-19',
  youtube: { en: 'lnr7T-IBHTw', de: 'lnr7T-IBHTw' },
} as const satisfies EpisodeInput;
