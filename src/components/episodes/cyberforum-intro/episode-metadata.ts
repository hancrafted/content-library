import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The CyberForum Akademie webinar's opening Episode, copied from the Workshop template: only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'cyberforum-intro',
  status: 'published',
  visibility: 'unlisted',
  format: 'short',
  tags: ['workflow', 'agentic-ai'],
  publishedOn: '2026-10-28',
} as const satisfies EpisodeInput;
