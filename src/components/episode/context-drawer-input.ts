import type { ContextDrawerInput } from '@/components/context-drawer/context-drawer-input';
import { readCatalogStrings } from '@/i18n/catalog-strings';
import { SHORTCUT_LABEL } from '@/lib/context-drawer.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { contextItemsOf } from './context-drawer-input.pure';
import type { PlacedEpisodeSection } from './episode-page-container.pure';

/*
 * THE SEAM, with `context-drawer-input.pure.ts`: the one place the Context
 * drawer's translated chrome is read from the catalog and an Episode record is
 * turned into `ContextDrawerInput`. Replaced by the Slide-registration contract.
 */

/*
 * The ICU leaves (formatted here, with their arguments) and `refNote` (read by
 * Slide text, not the drawer) stay out of the strings the drawer receives.
 */
const NOT_DRAWER_STRINGS = ['explainer', 'sourcesCount', 'citation', 'refNote'] as const;

export async function contextDrawerInput(
  locale: Locale,
  placed: readonly PlacedEpisodeSection[],
): Promise<ContextDrawerInput> {
  const t = await getTranslations({ locale, namespace: 'contextDrawer' });
  const explainer = t('explainer', { shortcut: SHORTCUT_LABEL });
  return {
    items: contextItemsOf(placed, explainer),
    labels: {
      strings: await readCatalogStrings(locale, 'contextDrawer', NOT_DRAWER_STRINGS),
      sources: (count) => t('sourcesCount', { count }),
      citation: (number) => t('citation', { number }),
    },
  };
}
