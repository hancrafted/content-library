import { findEpisode } from '@/components/episodes/registry';
import rawIndex from '@/lib/episode-index.json';
import { featured, parseEpisodeIndex, upcoming, type EpisodeIndexEntry } from '@/lib/episode-index.pure';
import { slidesOf } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { readingOrder, readingTime } from '@/lib/table-of-contents.pure';
import { getTranslations } from 'next-intl/server';
import { tocSectionsOf } from '../episode/episode-page-container.pure';
import { episodeCard, type EpisodeCard, type ReadKey } from './episode-card.pure';

/** The validated index, read once at build time; the one place the JSON is imported. */
const EPISODE_INDEX: readonly EpisodeIndexEntry[] = parseEpisodeIndex(rawIndex);

/** What the table of contents would total for a published Episode, so a card never quotes a number the page disagrees with. */
async function minutesOf(entry: EpisodeIndexEntry, locale: Locale): Promise<number | undefined> {
  if (entry.status !== 'published') return undefined;
  const { sections } = await findEpisode(entry.slug).content(locale);
  const { minutes } = readingOrder(tocSectionsOf(slidesOf(sections), locale));
  return readingTime(minutes, -1, 0).total;
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
  return Promise.all(
    ordered.map(async (entry) => episodeCard(entry, { locale, read, minutes: await minutesOf(entry, locale) })),
  );
}
