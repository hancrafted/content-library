import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The unlisted copy the CyberForum EXI Digital workshop presents: never in the overview, only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-ai', 'agentic-workflow'],
  publishedOn: '2026-11-18',
} as const satisfies EpisodeInput;
