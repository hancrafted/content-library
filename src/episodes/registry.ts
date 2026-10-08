import type { Episode } from '@/components/episode/episode-page-container.pure';
import { EPISODE_SLUGS, isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { pageTemplate } from './page-template/page-template';

/**
 * Every Episode, by slug (FE-002). Typed against `EPISODE_SLUGS`, so a slug
 * without a record, a record without a slug, or a key that differs from its
 * record's own slug fails `tsc`.
 */
const EPISODES: { readonly [S in EpisodeSlug]: Episode & { readonly slug: S } } = {
  'page-template': pageTemplate,
};

/** One static param per Episode; the dynamic route exports exactly these. */
export function episodeParams(): { episode: EpisodeSlug }[] {
  return EPISODE_SLUGS.map((episode) => ({ episode }));
}

export function findEpisode(slug: string): Episode {
  if (!isEpisodeSlug(slug)) notFound();
  return EPISODES[slug];
}
