import type { EpisodeMessages, EpisodeRecord } from '@/components/slide-master/slide';
import type { Locale } from '@/lib/locale.pure';
import { isAnyEpisodeSlug, type AnyEpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { aiAttentionSpan } from './ai-attention-span/ai-attention-span';
import { aiGivesYouMoreWork } from './ai-gives-you-more-work/ai-gives-you-more-work';
import { aiTokenEconomy } from './ai-token-economy/ai-token-economy';
import { axelAgenticWorkflowAgenda } from './axel-agentic-workflow-agenda/axel-agentic-workflow-agenda';
import { maintainingMarkdownForAi } from './maintaining-markdown-for-ai/maintaining-markdown-for-ai';
import { neverTooEarlySales } from './never-too-early-sales/never-too-early-sales';
import { onboardAiEveryTime } from './onboard-ai-every-time/onboard-ai-every-time';
import { pageTemplate } from './page-template/page-template';
import { slideLayouts } from './slide-layouts/slide-layouts';
import { slideMaster } from './slide-master/slide-master';
import { slides } from './slides/slides';

/**
 * Every Episode, by slug (FE-002), the unlisted ones included. Typed against `EPISODE_SLUGS` and
 * `UNLISTED_EPISODE_SLUGS`, so a slug
 * without a record or a record without a slug fails `tsc`, and so does a key
 * that differs from its record's own slug.
 */
const EPISODES: { readonly [S in AnyEpisodeSlug]: EpisodeRecord & { readonly slug: S } } = {
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
  'axel-agentic-workflow-agenda': axelAgenticWorkflowAgenda,
};

export function findEpisode(slug: string): EpisodeRecord {
  if (!isAnyEpisodeSlug(slug)) notFound();
  return EPISODES[slug];
}

/** An Episode's own text in one locale, from its record: what the page metadata and the landing card read. */
export function episodeCopy(slug: string, locale: Locale): EpisodeMessages {
  return findEpisode(slug).messages[locale];
}
