import type { Locale } from '@/shared/lib/locale.pure';
import { ownTranslator } from './localized-slide';
import type { Slide } from './slide';
import { titleLinesOf as titleLinesOfMessages, type TitleLines } from './slide-header-text';

/**
 * The lines the record's Title slide Scene (`title`) gives in its own messages for the Title slide: its `caption`, and
 * a `heading` for the `h1`, as a Slide's `heading` gives its on-screen title. The Episode title stays the page's metadata.
 */
export function titleLinesOf(slide: Slide, locale: Locale): TitleLines {
  return titleLinesOfMessages(ownTranslator(slide.messages[locale], locale));
}
