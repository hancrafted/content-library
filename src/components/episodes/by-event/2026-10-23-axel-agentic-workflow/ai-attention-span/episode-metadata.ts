import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The unlisted copy the AXEL seminar presented: never in the overview, only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'ai-attention-span',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'workflow'],
  publishedOn: '2026-10-23',
} as const satisfies EpisodeInput;
