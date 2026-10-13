import { featuredSlugs, listEpisodes } from '@/components/episodes/episode-repository';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { episodeMinutes } from '@/components/slide-master/localized-slide';
import { overviewOrder, type EpisodeMetadata } from '@/lib/episode-metadata.pure';
import type { Locale } from '@/lib/locale.pure';
import { isEpisodeSlug } from '@/lib/routes';
import { hasReadingTime, wholeMinutes } from '@/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardEntry, type EpisodeCard, type ReadKey } from './episode-card.pure';

/** A published Episode's whole reading time; none without a Voice script. */
function minutesOf(entry: EpisodeMetadata, locale: Locale): number | undefined {
  if (entry.status !== 'published') return undefined;
  const total = episodeMinutes(findEpisode(entry.slug), locale);
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

/** An Episode with a page (published, or upcoming with its slug registered) with its title and caption from the registry; a page-less upcoming one has no record. */
function withCopy(entry: EpisodeMetadata, locale: Locale): CardEntry {
  if (entry.status !== 'published' && !isEpisodeSlug(entry.slug)) return entry;
  const { title, caption } = episodeCopy(entry.slug, locale);
  return { ...entry, copy: { title, caption } };
}

/** The Episode's Featured slot, 1 first; none when it holds no slot. */
function featuredRankOf(slug: string): { featuredRank?: number } {
  const slot = (featuredSlugs() as readonly string[]).indexOf(slug);
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
  return overviewOrder(listEpisodes(), featuredSlugs()).map((entry) =>
    episodeCard(withCopy(entry, locale), {
      locale,
      read,
      minutes: minutesOf(entry, locale),
      ...featuredRankOf(entry.slug),
    }),
  );
}
