import type { EpisodeMessages, EpisodeRecord } from '@/components/slide-master/slide';
import type { Locale } from '@/lib/locale.pure';
import { isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { aiAttentionSpan } from './ai-attention-span/episode';
import { aiGivesYouMoreWork } from './ai-gives-you-more-work/episode';
import { aiTokenEconomy } from './ai-token-economy/episode';
import { maintainingMarkdownForAi } from './maintaining-markdown-for-ai/episode';
import { neverTooEarlySales } from './never-too-early-sales/episode';
import { onboardAiEveryTime } from './onboard-ai-every-time/episode';
import { pageTemplate } from './page-template/episode';
import { slideLayouts } from './slide-layouts/episode';
import { slideMaster } from './slide-master/episode';
import { slides } from './slides/episode';

/**
 * Every Episode, by slug (FE-002). Typed against `EPISODE_SLUGS`, so a slug
 * without a record or a record without a slug fails `tsc`, and so does a key
 * that differs from its record's own slug.
 */
const EPISODES: { readonly [S in EpisodeSlug]: EpisodeRecord & { readonly slug: S } } = {
  'page-template': pageTemplate,
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
  'never-too-early-sales': neverTooEarlySales,
  'onboard-ai-every-time': onboardAiEveryTime,
  'ai-attention-span': aiAttentionSpan,
  'ai-gives-you-more-work': aiGivesYouMoreWork,
  'slide-layouts': slideLayouts,
  'slide-master': slideMaster,
  slides,
};

export function findEpisode(slug: string): EpisodeRecord {
  if (!isEpisodeSlug(slug)) notFound();
  return EPISODES[slug];
}

/** An Episode's own text in one locale, from its record: what the page metadata and the landing card read. */
export function episodeCopy(slug: string, locale: Locale): EpisodeMessages {
  return findEpisode(slug).messages[locale];
}
