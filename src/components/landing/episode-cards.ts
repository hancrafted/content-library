import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { episodeMinutes } from '@/components/slide-master/localized-slide';
import type { Episode } from '@/content-store/schemas/episode.schema';
import { episodeVideo, featuredSlugs, listEpisodes } from '@/content-store/store';
import { overviewOrder } from '@/lib/episode-metadata.pure';
import type { Locale } from '@/lib/locale.pure';
import { isEpisodeSlug } from '@/lib/routes';
import { hasReadingTime, wholeMinutes } from '@/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardEntry, type EpisodeCard, type ReadKey } from './episode-card.pure';

/** A published Episode's whole reading time; none without a Voice script. */
function minutesOf(entry: Episode, locale: Locale): number | undefined {
  if (entry.status !== 'published') return undefined;
  const total = episodeMinutes(findEpisode(entry.slug), locale);
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

/** The Episode's video id in this locale; none without a page or a video. */
function youtubeOf(entry: Episode, locale: Locale): { youtubeId?: string } {
  if (!isEpisodeSlug(entry.slug)) return {};
  const id = episodeVideo(entry.slug, locale)?.id;
  return id === undefined ? {} : { youtubeId: id };
}

/** An Episode with a page (published, or upcoming with its slug registered) with its title and caption from the registry; a page-less upcoming one has no record. */
function withCopy(entry: Episode, locale: Locale): CardEntry {
  if (entry.status !== 'published' && !isEpisodeSlug(entry.slug)) return entry;
  const { title, caption } = episodeCopy(entry.slug, locale);
  return { ...entry, copy: { title, caption } };
}

/** The Episode's Featured slot, 1 first; none when it holds no slot. */
function featuredRankOf(slug: string): { featuredRank?: number } {
  const slot = (featuredSlugs() as readonly string[]).indexOf(slug);
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
  const entries = overviewOrder(listEpisodes({ includeDrafts: options?.includeDrafts }), featuredSlugs());
  return entries.map(await episodeCardMaker(locale, options));
}

/**
 * The card maker of one locale: each Episode it is handed as a localized card. The Event page hands it the Episodes its
 * Playlist lists, public or unlisted, through `eventPlaylistCards`, which opens each linked card under the Event.
 */
export async function episodeCardMaker(
  locale: Locale,
  options?: EpisodeCardsOptions,
): Promise<(entry: Episode) => EpisodeCard> {
  const t = await getTranslations({ locale });
  const read = t as unknown as ReadKey;
  return (entry) =>
    episodeCard(withCopy(entry, locale), {
      locale,
      read,
      minutes: minutesOf(entry, locale),
      ...youtubeOf(entry, locale),
      ...featuredRankOf(entry.slug),
      linkDrafts: options?.linkDrafts,
    });
}
