import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The unlisted copy the CyberForum EXI Digital workshop presents: never in the overview, only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'ai-gives-you-more-work',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-11-18',
} as const satisfies EpisodeInput;
