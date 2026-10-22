import type { ReadKey } from '@/components/landing/episode-card.pure';
import { workshopCard, type WorkshopCard } from '@/components/landing/workshop-card.pure';
import type { Locale } from '@/lib/locale.pure';
import { WORKSHOPS } from '@/lib/workshops.pure';
import { getTranslations } from 'next-intl/server';

/** Every Workshop as a localized card, in the record's order. */
export async function workshopCards(locale: Locale): Promise<WorkshopCard[]> {
  const t = await getTranslations({ locale });
  const page = await getTranslations({ locale, namespace: 'workshopsPage' });
  const episodeCount = { one: page('episodeCount.one'), other: page.raw('episodeCount.other') as string };
  return WORKSHOPS.map((record) => workshopCard(record, locale, { read: t as unknown as ReadKey, episodeCount }));
}
