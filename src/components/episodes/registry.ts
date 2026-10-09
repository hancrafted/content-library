import type { AnyEpisodeRecord } from '@/components/slide-master/episode-record';
import { isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { aiTokenEconomy } from './ai-token-economy/ai-token-economy';
import { amnesiacFreelancer } from './amnesiac-freelancer/amnesiac-freelancer';
import { maintainingMarkdownForAi } from './maintaining-markdown-for-ai/maintaining-markdown-for-ai';
import { pageTemplate } from './page-template/page-template';
import { slideLayouts } from './slide-layouts/slide-layouts';

/**
 * Every Episode, by slug (FE-002). Typed against `EPISODE_SLUGS`, so a slug
 * without a record or a record without a slug fails `tsc`, and so does a key
 * that differs from its record's own slug.
 */
const EPISODES: { readonly [S in EpisodeSlug]: AnyEpisodeRecord & { readonly slug: S } } = {
  'page-template': pageTemplate,
  'amnesiac-freelancer': amnesiacFreelancer,
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
  'slide-layouts': slideLayouts,
};

export function findEpisode(slug: string): AnyEpisodeRecord {
  if (!isEpisodeSlug(slug)) notFound();
  return EPISODES[slug];
}
