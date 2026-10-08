import type { ContextDrawerInput, ContextDrawerLabels } from '@/components/context-drawer/context-drawer-input';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { contextItemsOf } from './context-drawer-input.pure';
import type { EpisodeSection } from './episode-page-container.pure';

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
    menu: { label: t('menu.label'), layout: t('menu.layout'), side: t('menu.side'), overlay: t('menu.overlay') },
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
  sections: readonly EpisodeSection[],
): Promise<ContextDrawerInput> {
  return { items: contextItemsOf(sections), labels: await drawerLabels(locale) };
}
