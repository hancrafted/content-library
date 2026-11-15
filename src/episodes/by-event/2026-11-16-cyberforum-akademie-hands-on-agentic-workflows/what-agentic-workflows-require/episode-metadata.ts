import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The CyberForum Akademie hands-on workshop's copy of "What agentic workflows require of people and organisations": only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'what-agentic-workflows-require',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['agentic-workflow'],
  publishedOn: '2026-11-16',
} as const satisfies EpisodeInput;
