import type { PublishedEpisodeMetadata } from '@/lib/episode-metadata.pure';

/** What the Episode overview shows about this Episode; its title and caption are its own `i18n/` (#40). */
export const episodeMetadata = {
  slug: 'onboard-ai-every-time',
  status: 'published',
  // Needs human: the Brief names no Topic; ai-enablement is the closest existing Topic.
  topic: 'ai-enablement',
  look: { accent: 'amber', icon: 'user-round-plus' },
  format: 'foundations',
  tags: ['agentic-ai', 'context-engineering', 'workflow'],
  publishedOn: '2026-10-20',
} as const satisfies PublishedEpisodeMetadata;
