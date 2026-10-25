import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are Translation keys (#40). */
export const episodeMetadata = {
  slug: 'maintaining-markdown-for-ai',
  type: 'standard',
  visibility: 'public',
  status: 'published',
  format: 'foundations',
  tags: ['markdown', 'context-engineering'],
  publishedOn: '2026-10-09',
} as const satisfies PublishedEpisodeMetadata;
