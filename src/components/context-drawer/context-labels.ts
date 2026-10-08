import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/**
 * Pre-translated chrome for the Context drawer's entries (FE-010 §8). It stays
 * on the server: `sources` is a function, so it never crosses to the client
 * drawer, which takes `DrawerLabels` instead.
 */
export interface ContextLabels {
  readonly title: string;
  readonly open: string;
  readonly close: string;
  readonly shortcut: string;
  readonly tabs: { readonly notes: string; readonly script: string };
  readonly menu: { readonly label: string; readonly layout: string; readonly side: string; readonly overlay: string };
  readonly empty: { readonly notes: string; readonly script: string };
  /** The disclosure label of a note's sources, e.g. `Sources (2)`. */
  readonly sources: (count: number) => string;
  /** Said to assistive tech after a source link, e.g. `opens in a new tab`. */
  readonly opensInNewTab: string;
  readonly keywords: string;
  readonly bridge: string;
  readonly slide: string;
}

export async function contextLabels(locale: Locale): Promise<ContextLabels> {
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
    opensInNewTab: t('opensInNewTab'),
    keywords: t('keywords'),
    bridge: t('bridge'),
    slide: t('slide'),
  };
}
