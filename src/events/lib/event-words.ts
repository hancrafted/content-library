import type { EventSlug } from '@/content-store/catalogue/routes';
import type { Locale } from '@/shared/lib/locale.pure';
import de from '../i18n/de.json';
import en from '../i18n/en.json';

/**
 * The Events area's words in one locale, from its own Translation files (`events.*`): each Event's card text by slug,
 * the breadcrumb, the past-Event notice and the cues of the Playlist walk.
 */
export const EVENT_WORDS: Record<Locale, (typeof en)['events']> = { en: en.events, de: de.events };

/** An Event's title and description in one locale: its card's heading and text, and its page's metadata copy. */
export function eventCopy(slug: EventSlug, locale: Locale): { readonly title: string; readonly description: string } {
  return EVENT_WORDS[locale].items[slug];
}
