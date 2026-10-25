import { contentStore } from '@/components/episodes/content-store';
import type { ReadKey } from '@/components/landing/episode-card.pure';
import { eventCard, type EventCard } from '@/components/landing/event-card.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** The Events as localized cards, in the record's order: every one, or with `listedOnly` those whose Playlist is public. */
export async function eventCards(locale: Locale, options?: { listedOnly?: boolean }): Promise<EventCard[]> {
  const t = await getTranslations({ locale });
  const page = await getTranslations({ locale, namespace: 'eventsPage' });
  const episodeCount = { one: page('episodeCount.one'), other: page.raw('episodeCount.other') as string };
  const { events, playlists } = contentStore();
  // The store refused any Event whose Playlist is missing, so every lookup finds one.
  const playlistOf = (id: string) => playlists.find((each) => each.id === id);
  return events
    .filter((record) => !options?.listedOnly || playlistOf(record.playlist)?.visibility === 'public')
    .map((record) =>
      eventCard({ record, episodes: playlistOf(record.playlist)?.episodes ?? [] }, locale, {
        read: t as unknown as ReadKey,
        episodeCount,
      }),
    );
}
