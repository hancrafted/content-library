import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The unlisted copy the AXEL seminar presented: never in the overview, only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  visibility: 'unlisted',
  format: 'foundations',
  tags: ['context-engineering', 'agentic-ai', 'workflow'],
  publishedOn: '2026-10-23',
  youtube: { id: '0nB6wp9i6PI', language: 'en' },
} as const satisfies EpisodeInput;
