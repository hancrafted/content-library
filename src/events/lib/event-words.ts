import type { EventSlug } from '@/content-store/catalogue/record-routes';
import type { Locale } from '@/shared/lib/locale.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Events area's words in one locale, from its own Translation files (`events.*`): each Event's card text by slug,
 * the Episode count, the breadcrumb, the past-Event notice, the position line and the cues of the Playlist walk. The
 * area's one word map: everything it draws reads its words here, never through next-intl.
 */
export const EVENT_WORDS: Record<Locale, (typeof en)['events']> = { en: en.events, de: de.events };

/** An Event's title and description in one locale. */
export interface EventCopy {
  readonly title: string;
  readonly description: string;
}

/**
 * An Event's title and description in one locale, the one read of them: its card's heading and text, its page's
 * metadata copy, and its step in the breadcrumb and the Playlist walk. Keyed by the Event registry's slugs, so a
 * registered Event with no words fails `tsc`; a slug the registry does not hold, which only a cast lets through, throws
 * naming the Event rather than drawing a blank.
 */
export function eventCopy(slug: EventSlug, locale: Locale): EventCopy {
  const copy: EventCopy | undefined = EVENT_WORDS[locale].items[slug];
  if (copy === undefined) throw new Error(`No words name the Event "${slug}" in ${locale}`);
  return copy;
}
