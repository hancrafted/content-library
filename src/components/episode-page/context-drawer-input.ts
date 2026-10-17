import type { ContextDrawerInput } from '@/components/context-drawer/context-drawer-input';
import type { LocalizedSlide, SlideContext } from '@/components/slide-master/localized-slide';
import { readTranslationStrings } from '@/i18n/translation-strings';
import { TRANSLATIONS } from '@/i18n/translations';
import { SHORTCUT_LABEL } from '@/lib/context-drawer.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { checkDrawerStrings, contextItemsOf, NOT_DRAWER_STRINGS } from './context-drawer-input.pure';

/*
 * THE SEAM, with `context-drawer-input.pure.ts`: the one place the Context
 * drawer's translated chrome is read from the Translation file and an Episode record is
 * turned into `ContextDrawerInput`.
 */

export async function contextDrawerInput(
  locale: Locale,
  slides: readonly LocalizedSlide[],
  title?: SlideContext,
): Promise<ContextDrawerInput> {
  const t = await getTranslations({ locale, namespace: 'contextDrawer' });
  checkDrawerStrings(TRANSLATIONS[locale].contextDrawer);
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
