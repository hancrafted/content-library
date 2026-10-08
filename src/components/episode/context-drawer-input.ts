import type { ContextDrawerInput, ContextDrawerLabels } from '@/components/context-drawer/context-drawer-input';
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

async function drawerLabels(locale: Locale): Promise<ContextDrawerLabels> {
  const t = await getTranslations({ locale, namespace: 'contextDrawer' });
  return {
    title: t('title'),
    open: t('open'),
    close: t('close'),
    shortcut: t('shortcut'),
    tabs: { notes: t('tabs.notes'), script: t('tabs.script') },
    menu: { label: t('menu.label'), layout: t('menu.layout'), beside: t('menu.beside'), over: t('menu.over') },
    empty: { notes: t('empty.notes'), script: t('empty.script') },
    sources: (count) => t('sourcesCount', { count }),
    citation: (number) => t('citation', { number }),
    opensInNewTab: t('opensInNewTab'),
    keywords: t('keywords'),
    bridge: t('bridge'),
    slide: t('slide'),
  };
}

export async function contextDrawerInput(
  locale: Locale,
  placed: readonly PlacedEpisodeSection[],
): Promise<ContextDrawerInput> {
  const t = await getTranslations({ locale, namespace: 'contextDrawer' });
  const explainer = t('explainer', { shortcut: SHORTCUT_LABEL });
  return { items: contextItemsOf(placed, explainer), labels: await drawerLabels(locale) };
}
