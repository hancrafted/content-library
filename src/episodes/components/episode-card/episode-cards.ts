import { hasPage } from '@/content-store/catalogue/record-routes';
import { episodeVideo, featuredIds, listedEpisodes, type LoadedEpisode } from '@/content-store/store';
import { overviewOrder } from '@/episodes/lib/episode-metadata.pure';
import { summaryOf } from '@/episodes/lib/page-summary';
import { anchorTitleAt } from '@/episodes/lib/page-summary.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { hasReadingTime, wholeMinutes } from '@/shared/lib/speaking-time.pure';
import { getTranslations } from 'next-intl/server';
import { episodeCard, type CardEntry, type EpisodeCard, type ReadKey } from './episode-card.pure';

function minutesOf(entry: LoadedEpisode, locale: Locale): number | undefined {
  if (entry.status !== 'published' || !hasPage(entry.ref)) return undefined;
  const total = summaryOf(entry.ref)[locale].minutes;
  return hasReadingTime(total) ? wholeMinutes(total) : undefined;
}

function youtubeOf(entry: LoadedEpisode, locale: Locale): { youtubeId?: string } {
  if (!hasPage(entry.ref)) return {};
  const id = episodeVideo(entry.ref, locale)?.id;
  return id === undefined ? {} : { youtubeId: id };
}

function withCopy(entry: LoadedEpisode, locale: Locale): CardEntry {
  const { ref } = entry;
  if (hasPage(ref)) {
    const { title, caption } = summaryOf(ref)[locale];
    return { ...entry, copy: { title, caption } };
  }
  if (entry.status !== 'published') return entry;
  throw new Error(`The published Episode "${ref.id}" has no page to read its title and caption from`);
}

function featuredRankOf(id: string): { featuredRank?: number } {
  const slot = (featuredIds() as readonly string[]).indexOf(id);
  return slot === -1 ? {} : { featuredRank: slot + 1 };
}

export interface EpisodeCardsOptions {
  readonly includeDrafts?: boolean;
  readonly linkDrafts?: boolean;
}

// decision: FE-006 §4
export async function episodeCards(locale: Locale, options?: EpisodeCardsOptions): Promise<EpisodeCard[]> {
  const listed = listedEpisodes();
  const shown = (options?.includeDrafts ?? true) ? listed : listed.filter(({ status }) => status === 'published');
  const entries = overviewOrder(shown, featuredIds());
  const makeCard = await episodeCardMaker(locale, options);
  return entries.map((entry) => makeCard(entry));
}

function atSection(
  card: EpisodeCard,
  { entry, anchor }: { entry: LoadedEpisode; anchor: string },
  locale: Locale,
): EpisodeCard {
  const title = hasPage(entry.ref) ? anchorTitleAt(summaryOf(entry.ref)[locale], anchor) : undefined;
  if (typeof title !== 'string') throw new Error(`The Episode "${entry.ref.id}" has no Section at "${anchor}"`);
  const { slug, route, href, status, leadTag, format, featuredRank } = card;
  return { slug, route, href, status, title, caption: '', leadTag, format, tags: [], featuredRank };
}

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
