import type { ReadKey } from '@/components/landing/episode-card.pure';
import { eventCard, type EventCard } from '@/components/landing/event-card.pure';
import { listEvents, playlistOf } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/**
 * The Events as localized cards, in record order, read through the content store: every one, or with `listedOnly`
 * those whose Playlist is public, which are the ones `/events` lists (design-ADR 0016, Routes and visibility).
 */
export async function eventCards(locale: Locale, options?: { listedOnly?: boolean }): Promise<EventCard[]> {
  const t = await getTranslations({ locale });
  const page = await getTranslations({ locale, namespace: 'eventsPage' });
  const episodeCount = { one: page('episodeCount.one'), other: page.raw('episodeCount.other') as string };
  const read = t as unknown as ReadKey;
  return listEvents()
    .filter((event) => !options?.listedOnly || playlistOf(event).visibility === 'public')
    .map((event) => eventCard({ event, playlist: playlistOf(event) }, locale, { read, episodeCount }));
}
