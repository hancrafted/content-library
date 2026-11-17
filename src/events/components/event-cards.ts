import { listedEvents, listEvents } from '@/content-store/store';
import { eventCard, type EventCard, type TagWordMap } from '@/events/lib/event-card.pure';
import type { Locale } from '@/shared/lib/locale.pure';

// decision: docs/adr/0016-content-data-model.md
export function eventCards(locale: Locale, tagWords: TagWordMap, options?: { listedOnly?: boolean }): EventCard[] {
  const events = options?.listedOnly ? listedEvents() : listEvents();
  return events.map((event) => eventCard(event, locale, tagWords));
}
