import type { LocalizedSlide, SlideContext } from '@/episodes/components/slide-master/localized-slide';
import { readTranslationStrings } from '@/shared/i18n/translation-strings';
import { TRANSLATIONS } from '@/shared/i18n/translations';
import { SHORTCUT_LABEL } from '@/shared/lib/context-drawer.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import type { ContextDrawerInput } from '@/shared/page-chrome/context-drawer/context-drawer-input';
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
