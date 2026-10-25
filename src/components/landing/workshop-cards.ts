import type { ReadKey } from '@/components/landing/episode-card.pure';
import { workshopCard, type WorkshopCard } from '@/components/landing/workshop-card.pure';
import { listEvents, playlistOf } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** Every Event as a localized Workshop card, in record order, read through the content store. */
export async function workshopCards(locale: Locale): Promise<WorkshopCard[]> {
  const t = await getTranslations({ locale });
  const page = await getTranslations({ locale, namespace: 'workshopsPage' });
  const episodeCount = { one: page('episodeCount.one'), other: page.raw('episodeCount.other') as string };
  const read = t as unknown as ReadKey;
  return listEvents().map((event) =>
    workshopCard({ event, playlist: playlistOf(event) }, locale, { read, episodeCount }),
  );
}
