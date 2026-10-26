import { episodeVideo, featuredIds, listedEpisodes, type LoadedEpisode } from '@/content-store/store';
import { episodeMinutes } from '@/episodes/components/slide-master/localized-slide';
import { overviewOrder } from '@/episodes/lib/episode-metadata.pure';
import { episodeCopy, findEpisode } from '@/episodes/lib/registry';
import type { Locale } from '@/lib/locale.pure';
import { isEpisodeId } from '@/lib/routes';
import { hasReadingTime, wholeMinutes } from '@/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardEntry, type EpisodeCard, type ReadKey } from './episode-card.pure';

/** A published Episode's whole reading time; none without a Voice script. */
function minutesOf(entry: LoadedEpisode, locale: Locale): number | undefined {
  if (entry.status !== 'published') return undefined;
  const total = episodeMinutes(findEpisode(entry.id), locale);
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

/** The Episode's video id in this locale; none without a page or a video. */
function youtubeOf(entry: LoadedEpisode, locale: Locale): { youtubeId?: string } {
  if (!isEpisodeId(entry.id)) return {};
  const id = episodeVideo(entry.id, locale)?.id;
  return id === undefined ? {} : { youtubeId: id };
}

/** An Episode with a page (published, or upcoming with its id registered) with its title and caption from the registry, by id; a page-less upcoming one has no record. */
function withCopy(entry: LoadedEpisode, locale: Locale): CardEntry {
  if (entry.status !== 'published' && !isEpisodeId(entry.id)) return entry;
  const { title, caption } = episodeCopy(entry.id, locale);
  return { ...entry, copy: { title, caption } };
}

/** The Episode's Featured slot, 1 first; none when it holds no slot. */
function featuredRankOf(id: string): { featuredRank?: number } {
  const slot = (featuredIds() as readonly string[]).indexOf(id);
  return slot === -1 ? {} : { featuredRank: slot + 1 };
}

export interface EpisodeCardsOptions {
  readonly includeDrafts?: boolean;
  readonly linkDrafts?: boolean;
}

/**
 * Every public Episode the read API lists, as a localized card (FE-006 §4: plain
 * data, safe to hand to a client leaf), in overview order: Featured first,
 * then the other published ones newest first, then the upcoming ones. An
 * unlisted Episode is never among them; it lives only under its Event.
 */
export async function episodeCards(locale: Locale, options?: EpisodeCardsOptions): Promise<EpisodeCard[]> {
  const listed = listedEpisodes();
  const shown = (options?.includeDrafts ?? true) ? listed : listed.filter(({ status }) => status === 'published');
  const entries = overviewOrder(shown, featuredIds());
  return entries.map(await episodeCardMaker(locale, options));
}

/**
 * The card maker of one locale: each Episode it is handed as a localized card. The Event page hands it the Episodes its
 * Playlist lists, public or unlisted, through `eventPlaylistCards`, which opens each linked card under the Event.
 */
export async function episodeCardMaker(
  locale: Locale,
  options?: EpisodeCardsOptions,
): Promise<(entry: LoadedEpisode) => EpisodeCard> {
  const t = await getTranslations({ locale });
  const read = t as unknown as ReadKey;
  return (entry) =>
    episodeCard(withCopy(entry, locale), {
      locale,
      read,
      minutes: minutesOf(entry, locale),
      ...youtubeOf(entry, locale),
      ...featuredRankOf(entry.id),
      linkDrafts: options?.linkDrafts,
    });
}
