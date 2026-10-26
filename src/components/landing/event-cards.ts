import type { ReadKey } from '@/components/landing/episode-card.pure';
import { eventCard, type EventCard, type EventReads } from '@/components/landing/event-card.pure';
import { listedEvents, listEvents, type ServedEvent } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** What an Event card reads from the Translation file in one locale. */
async function readsOf(locale: Locale): Promise<EventReads> {
  const t = await getTranslations({ locale });
  const page = await getTranslations({ locale, namespace: 'eventsPage' });
  const episodeCount = { one: page('episodeCount.one'), other: page.raw('episodeCount.other') as string };
  return { read: t as unknown as ReadKey, episodeCount };
}

/**
 * The Events as localized cards, in record order, read through the content store: every one, or with `listedOnly`
 * the ones `/events` lists, as the page catalogue decides (design-ADR 0016, Routes and visibility).
 */
export async function eventCards(locale: Locale, options?: { listedOnly?: boolean }): Promise<EventCard[]> {
  const reads = await readsOf(locale);
  const events = options?.listedOnly ? listedEvents() : listEvents();
  return events.map((event) => eventCard(event, locale, reads));
}

/** One Event as a localized card: what its own page draws its title, description and facts from. */
export async function eventCardOf(event: ServedEvent, locale: Locale): Promise<EventCard> {
  return eventCard(event, locale, await readsOf(locale));
}
