import type { EventSlug } from '@/content-store/catalogue/record-routes';
import type { Locale } from '@/shared/lib/locale.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const EVENT_WORDS: Record<Locale, (typeof en)['events']> = { en: en.events, de: de.events };

export interface EventCopy {
  readonly title: string;
  readonly description: string;
}

export function eventCopy(slug: EventSlug, locale: Locale): EventCopy {
  const copy: EventCopy | undefined = EVENT_WORDS[locale].items[slug];
  if (copy === undefined) throw new Error(`No words name the Event "${slug}" in ${locale}`);
  return copy;
}
