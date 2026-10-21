import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  topic: 'ai-enablement',
  format: 'foundations',
  tags: [],
  publishedOn: '2026-10-21',
} as const satisfies PublishedEpisodeMetadata;
