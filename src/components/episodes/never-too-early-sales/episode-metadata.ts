import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'never-too-early-sales',
  type: 'standard',
  visibility: 'public',
  status: 'published',
  format: 'foundations',
  tags: ['sales'],
  publishedOn: '2026-10-19',
} as const satisfies PublishedEpisodeMetadata;
