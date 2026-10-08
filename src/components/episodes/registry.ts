import type { Episode } from '@/components/episode/episode-page-container.pure';
import { isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { amnesiacFreelancer } from './amnesiac-freelancer/amnesiac-freelancer';
import { pageTemplate } from './page-template/page-template';

/**
 * Every Episode, by slug (FE-002). Typed against `EPISODE_SLUGS`, so a slug
 * without a record or a record without a slug fails `tsc`, and so does a key
 * that differs from its record's own slug.
 */
const EPISODES: { readonly [S in EpisodeSlug]: Episode & { readonly slug: S } } = {
  'page-template': pageTemplate,
  'amnesiac-freelancer': amnesiacFreelancer,
};

export function findEpisode(slug: string): Episode {
  if (!isEpisodeSlug(slug)) notFound();
  return EPISODES[slug];
}
