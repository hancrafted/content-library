import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** Pre-translated chrome for the Context drawer and its entries (FE-010 §8). */
export interface ContextLabels {
  readonly title: string;
  readonly open: string;
  readonly close: string;
  readonly shortcut: string;
  readonly tabs: { readonly notes: string; readonly script: string };
  readonly empty: { readonly notes: string; readonly script: string };
  readonly sources: string;
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
    empty: { notes: t('empty.notes'), script: t('empty.script') },
    sources: t('sources'),
    keywords: t('keywords'),
    bridge: t('bridge'),
    slide: t('slide'),
  };
}
