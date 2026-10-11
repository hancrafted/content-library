import { slideMinutes } from '@/components/episode-page/slide-context.pure';
import { listEpisodes } from '@/components/episodes/episode-repository';
import { findEpisode } from '@/components/episodes/registry';
import { ownTranslator } from '@/components/slide-master/slide-kit';
import { overviewOrder, type EpisodeMetadata } from '@/lib/episode-metadata.pure';
import { FEATURED } from '@/lib/episode-overview';
import type { Locale } from '@/lib/locale.pure';
import { hasReadingTime, wholeMinutes } from '@/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardContext, type EpisodeCard, type ReadKey } from './episode-card.pure';

/**
 * What the table of contents totals for a published Episode: every Slide's
 * spoken minutes, listed or not, rounded as the table of contents rounds them,
 * so a card never quotes a number the page disagrees with. None without a Voice script.
 */
function minutesOf(entry: EpisodeMetadata, locale: Locale): number | undefined {
  if (entry.status !== 'published') return undefined;
  const record = findEpisode(entry.slug);
  const total = record.sections
    .flat()
    .map((slide) => slideMinutes(ownTranslator(slide.messages[locale], locale), slide, locale))
    .reduce((sum, minutes) => sum + minutes, 0);
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

/** A published Episode's title and caption, read through the registry; an upcoming one has no record. */
function copyOf(entry: EpisodeMetadata, locale: Locale): Pick<CardContext, 'copy'> {
  if (entry.status !== 'published') return {};
  const { title, caption } = findEpisode(entry.slug).messages[locale];
  return { copy: { title, caption } };
}

/** The Episode's Featured slot, 1 first; none when it holds no slot. */
function featuredRankOf(slug: string): { featuredRank?: number } {
  const slot = (FEATURED as readonly string[]).indexOf(slug);
  return slot === -1 ? {} : { featuredRank: slot + 1 };
}

/**
 * Every Episode the read API lists, as a localized card (FE-006 §4: plain
 * data, safe to hand to a client leaf), in overview order: Featured first,
 * then the other published ones newest first, then the upcoming ones.
 */
export async function episodeCards(locale: Locale): Promise<EpisodeCard[]> {
  const t = await getTranslations({ locale });
  const read = t as unknown as ReadKey;
  return overviewOrder(listEpisodes(), FEATURED).map((entry) =>
    episodeCard(entry, {
      locale,
      read,
      minutes: minutesOf(entry, locale),
      ...copyOf(entry, locale),
      ...featuredRankOf(entry.slug),
    }),
  );
}
