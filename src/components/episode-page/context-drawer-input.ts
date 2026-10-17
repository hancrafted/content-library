import type { ContextDrawerInput } from '@/components/context-drawer/context-drawer-input';
import type { LocalizedSlide, SlideContext } from '@/components/slide-master/localized-slide';
import { readTranslationStrings } from '@/i18n/translation-strings';
import { SHORTCUT_LABEL } from '@/lib/context-drawer.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { contextItemsOf } from './context-drawer-input.pure';

/*
 * THE SEAM, with `context-drawer-input.pure.ts`: the one place the Context
 * drawer's translated chrome is read from the Translation file and an Episode record is
 * turned into `ContextDrawerInput`.
 */

/*
 * The ICU leaves (formatted here, with their arguments) and `refNote` and
 * `markerNote` (read by Slide text, not the drawer) stay out of the strings the
 * drawer receives.
 */
export const NOT_DRAWER_STRINGS = ['explainer', 'sourcesCount', 'citation', 'refNote', 'markerNote'] as const;

export async function contextDrawerInput(
  locale: Locale,
  slides: readonly LocalizedSlide[],
  title?: SlideContext,
): Promise<ContextDrawerInput> {
  const t = await getTranslations({ locale, namespace: 'contextDrawer' });
  const explainer = t('explainer', { shortcut: SHORTCUT_LABEL });
  return {
    items: contextItemsOf(slides, explainer, title),
    labels: {
      strings: await readTranslationStrings(locale, 'contextDrawer', NOT_DRAWER_STRINGS),
      sources: (count) => t('sourcesCount', { count }),
      citation: (number) => t('citation', { number }),
    },
  };
}
