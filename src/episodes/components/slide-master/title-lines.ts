import type { Locale } from '@/shared/lib/locale.pure';
import { ownTranslator } from './localized-slide';
import type { Slide } from './slide';
import { titleLinesOf as titleLinesOfMessages, type TitleLines } from './slide-header-text';

export function titleLinesOf(slide: Slide, locale: Locale): TitleLines {
  return titleLinesOfMessages(ownTranslator(slide.messages[locale], locale));
}
