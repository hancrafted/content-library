import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The CyberForum Akademie hands-on workshop's copy of "What lies below the waterline of sustainable AI skills": only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering'],
  publishedOn: '2026-11-16',
} as const satisfies EpisodeInput;
