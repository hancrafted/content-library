import type { Locale } from '@/lib/locale.pure';
import { createTranslator } from 'next-intl';
import type { SlideMessages } from './slide';
import type { RuntimeTranslator } from './slide-base';

/**
 * A Slide's translator: next-intl's `createTranslator` over the
 * Slide's own messages for the page's locale. Like the site-wide config
 * (`src/i18n/request.ts`), any missing message or formatting error throws, so
 * untranslated text fails the build instead of shipping. The kit adds the
 * default rich tags, as for every Slide.
 */
export function ownTranslator(messages: SlideMessages, locale: Locale): RuntimeTranslator {
  const t = createTranslator({
    locale,
    messages,
    onError(error) {
      throw error;
    },
  });
  // `messages` is a runtime record, so next-intl types `t` over unknown keys
  // and its overloads don't line up with RuntimeTranslator's open signature.
  // The members are the same at runtime. Each Slide's typed translator is
  // checked against its own JSON at the Slide (see the type tests in slide.test.ts).
  return t as unknown as RuntimeTranslator;
}
