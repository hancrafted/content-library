import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are Translation keys (#40). */
export const episodeMetadata = {
  slug: 'maintaining-markdown-for-ai',
  status: 'published',
  topic: 'knowledge-base',
  format: 'foundations',
  tags: ['markdown', 'verification', 'review', 'google-okf'],
  publishedOn: '2026-10-09',
} as const satisfies PublishedEpisodeMetadata;
