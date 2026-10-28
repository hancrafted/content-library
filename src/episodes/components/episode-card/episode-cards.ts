import { hasPage } from '@/content-store/catalogue/record-routes';
import { episodeVideo, featuredIds, listedEpisodes, type LoadedEpisode } from '@/content-store/store';
import { episodeMinutes } from '@/episodes/components/slide-master/localized-slide';
import { overviewOrder } from '@/episodes/lib/episode-metadata.pure';
import { sectionOf } from '@/episodes/lib/episode.pure';
import { compositionOf } from '@/episodes/lib/registry';
import type { Locale } from '@/shared/lib/locale.pure';
import { hasReadingTime, wholeMinutes } from '@/shared/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardEntry, type EpisodeCard, type ReadKey } from './episode-card.pure';

/** A published Episode's whole reading time; none without a Voice script. */
function minutesOf(entry: LoadedEpisode, locale: Locale): number | undefined {
  if (entry.status !== 'published' || !hasPage(entry.ref)) return undefined;
  const total = episodeMinutes(compositionOf(entry.ref), locale);
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

/** The Episode's video id in this locale; none without a page or a video. */
function youtubeOf(entry: LoadedEpisode, locale: Locale): { youtubeId?: string } {
  if (!hasPage(entry.ref)) return {};
  const id = episodeVideo(entry.ref, locale)?.id;
  return id === undefined ? {} : { youtubeId: id };
}

/**
 * An Episode with a page (published, or upcoming with its id registered) with its title and caption from the registry,
 * by its ref; a page-less upcoming one has no record, and a page-less published one is a bug, so it throws.
 */
function withCopy(entry: LoadedEpisode, locale: Locale): CardEntry {
  const { ref } = entry;
  if (hasPage(ref)) {
    const { title, caption } = compositionOf(ref).messages[locale];
    return { ...entry, copy: { title, caption } };
  }
  if (entry.status !== 'published') return entry;
  throw new Error(`The published Episode "${ref.id}" has no page to read its title and caption from`);
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
  const makeCard = await episodeCardMaker(locale, options);
  return entries.map((entry) => makeCard(entry));
}

/**
 * The card of a Playlist entry that opens its Episode at an anchor: the title of the Section the anchor names, and
 * nothing else of the Episode's (no caption, Tags, date, video or reading time), since it is a step inside one. An
 * anchor the Episode does not have is a bug, so it throws.
 */
function atSection(
  card: EpisodeCard,
  { entry, anchor }: { entry: LoadedEpisode; anchor: string },
  locale: Locale,
): EpisodeCard {
  const section = hasPage(entry.ref) ? sectionOf(compositionOf(entry.ref).sections, anchor) : undefined;
  const title = section?.messages[locale].title;
  if (typeof title !== 'string') throw new Error(`The Episode "${entry.ref.id}" has no Section at "${anchor}"`);
  const { slug, route, href, status, leadTag, format, featuredRank } = card;
  return { slug, route, href, status, title, caption: '', leadTag, format, tags: [], featuredRank };
}

/**
 * The card maker of one locale: each Episode it is handed as a localized card. The Event page hands it each entry its
 * Playlist lists, public or unlisted, through `eventPlaylistCards`, which opens each linked card under the Event; an
 * entry at an anchor gets that Section's card.
 */
export async function episodeCardMaker(
  locale: Locale,
  options?: EpisodeCardsOptions,
): Promise<(entry: LoadedEpisode, anchor?: string) => EpisodeCard> {
  const t = await getTranslations({ locale });
  const read = t as unknown as ReadKey;
  return (entry, anchor) => {
    const card = episodeCard(withCopy(entry, locale), {
      locale,
      read,
      minutes: minutesOf(entry, locale),
      ...youtubeOf(entry, locale),
      ...featuredRankOf(entry.ref.id),
      linkDrafts: options?.linkDrafts,
    });
    return anchor === undefined ? card : atSection(card, { entry, anchor }, locale);
  };
}
