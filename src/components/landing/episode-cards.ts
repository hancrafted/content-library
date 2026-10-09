import { slideMinutes } from '@/components/episode-page/slide-context.pure';
import { findEpisode } from '@/components/episodes/registry';
import rawIndex from '@/lib/episode-index.json';
import { featured, parseEpisodeIndex, upcoming, type EpisodeIndexEntry } from '@/lib/episode-index.pure';
import type { Locale } from '@/lib/locale.pure';
import { wholeMinutes } from '@/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type EpisodeCard, type ReadKey } from './episode-card.pure';

/** The validated index, read once at build time; the one place the JSON is imported. */
const EPISODE_INDEX: readonly EpisodeIndexEntry[] = parseEpisodeIndex(rawIndex);

/**
 * What the table of contents totals for a published Episode: every Slide's
 * spoken minutes, listed or not, rounded as the table of contents rounds them,
 * so a card never quotes a number the page disagrees with. None without a Voice script.
 */
function minutesOf(entry: EpisodeIndexEntry, locale: Locale, read: ReadKey): number | undefined {
  if (entry.status !== 'published') return undefined;
  const record = findEpisode(entry.slug);
  const total = record.sections
    .flat()
    .map((slide) => slideMinutes((key) => read(`episodes.${record.slug}.slides.${slide.slug}.${key}`), slide, locale))
    .reduce((sum, minutes) => sum + minutes, 0);
  return total > 0 ? wholeMinutes(total) : undefined;
}

/**
 * Every Episode in the index as a localized card (FE-006 §4: plain data, safe
 * to hand to a client leaf): published Episodes by featured rank, then the
 * upcoming ones in the order the index lists them.
 */
export async function episodeCards(locale: Locale): Promise<EpisodeCard[]> {
  const t = await getTranslations({ locale });
  const read = t as unknown as ReadKey;
  const ordered = [...featured(EPISODE_INDEX, EPISODE_INDEX.length), ...upcoming(EPISODE_INDEX)];
  return ordered.map((entry) => episodeCard(entry, { locale, read, minutes: minutesOf(entry, locale, read) }));
}
