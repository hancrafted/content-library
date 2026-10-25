import type { Locale } from '@/lib/locale.pure';
import { createTranslator } from 'next-intl';
import type { SlideMessages } from './slide';
import type { RuntimeTranslator } from './slide-base';

/*
 * The translator over one Slide's own messages, or an Episode's: what the Localized Slide reads a Slide's text with,
 * and what a page that names one Speaker note reads its header with.
 */

/**
 * next-intl's `createTranslator` over the Slide's own messages. Like the
 * site-wide config (`src/i18n/request.ts`), any missing message or formatting
 * error throws, so untranslated text fails the build instead of shipping.
 */
export function ownTranslator(messages: SlideMessages, locale: Locale): RuntimeTranslator {
  const t = createTranslator({
    locale,
    messages,
    onError(error) {
      throw error;
    },
  });
  // `messages` is a runtime record, so next-intl types `t` over unknown keys and
  // its overloads don't line up with RuntimeTranslator's open signature. The
  // members are the same at runtime; each Slide's typed translator is checked
  // against its own JSON at the Slide (the type tests in slide.test.ts).
  return t as unknown as RuntimeTranslator;
}

/**
 * The header of one Speaker note in `locale`, read from the messages that hold it: a Slide's own, or the Episode's
 * for a Title slide note. What a page that lists the note names it by.
 */
export function noteHeaderOf(messages: SlideMessages, note: string, locale: Locale): string {
  return ownTranslator(messages, locale)(`notes.${note}.header`);
}
