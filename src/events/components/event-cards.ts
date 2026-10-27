import { listedEvents, listEvents } from '@/content-store/store';
import { eventCard, type EventCard, type TagWordMap } from '@/events/lib/event-card.pure';
import type { Locale } from '@/shared/lib/locale.pure';

/**
 * The Events as localized cards, in record order, read through the content store: every one, or with `listedOnly`
 * the ones `/events` lists, as the page catalogue decides (design-ADR 0016, Routes and visibility). The Tags' words
 * come from page assembly, which owns them.
 */
export function eventCards(locale: Locale, tagWords: TagWordMap, options?: { listedOnly?: boolean }): EventCard[] {
  const events = options?.listedOnly ? listedEvents() : listEvents();
  return events.map((event) => eventCard(event, locale, tagWords));
}
