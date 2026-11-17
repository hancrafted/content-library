import type { Locale } from '@/shared/lib/locale.pure';
import chromeDe from '@/shared/page-chrome/i18n/de.json';
import chromeEn from '@/shared/page-chrome/i18n/en.json';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const PAGE_WORDS: Record<Locale, typeof en & Pick<typeof chromeEn, 'brand'>> = {
  en: { ...en, brand: chromeEn.brand },
  de: { ...de, brand: chromeDe.brand },
};
