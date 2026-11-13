import type { EpisodeInput } from '@/content-store/schemas/episode.schema';

/** The CyberForum Akademie hands-on workshop's opening Episode, a verbatim copy of the 2026-10-28 webinar's intro for now, copied from the Workshop template: only under its Event; its title and caption are its own `i18n/`. */
export const episodeMetadata = {
  slug: 'intro',
  status: 'published',
  visibility: 'unlisted',
  format: 'short',
  tags: ['overview', 'agentic-workflow', 'agentic-ai'],
  publishedOn: '2026-11-16',
} as const satisfies EpisodeInput;
