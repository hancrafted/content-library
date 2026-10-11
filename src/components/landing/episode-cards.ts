import { listEpisodes } from '@/components/episodes/episode-repository';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { slideText } from '@/components/slide-master/localized-slide';
import { overviewOrder, type EpisodeMetadata } from '@/lib/episode-metadata.pure';
import { FEATURED } from '@/lib/episode-overview';
import type { Locale } from '@/lib/locale.pure';
import { hasReadingTime, wholeMinutes } from '@/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardEntry, type EpisodeCard, type ReadKey } from './episode-card.pure';

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
    .map((slide) => slideText(slide, locale).minutes)
    .reduce((sum, minutes) => sum + minutes, 0);
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

/** A published Episode with its title and caption from the registry; an upcoming one has no record. */
function withCopy(entry: EpisodeMetadata, locale: Locale): CardEntry {
  if (entry.status !== 'published') return entry;
  const { title, caption } = episodeCopy(entry.slug, locale);
  return { ...entry, copy: { title, caption } };
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
    episodeCard(withCopy(entry, locale), {
      locale,
      read,
      minutes: minutesOf(entry, locale),
      ...featuredRankOf(entry.slug),
    }),
  );
}
