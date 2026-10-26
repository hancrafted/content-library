import type { Locale } from '@/shared/lib/locale.pure';
import chromeDe from '@/shared/page-chrome/i18n/de.json';
import chromeEn from '@/shared/page-chrome/i18n/en.json';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The words page metadata and structured data draw on, per locale: page assembly's own Translation files (`meta.<kind>`
 * for a page that presents no record, the Person behind the site) and the site's name from page chrome's. Read
 * synchronously, since a route's `metadata` export is not async.
 */
export const PAGE_WORDS: Record<Locale, typeof en & Pick<typeof chromeEn, 'brand'>> = {
  en: { ...en, brand: chromeEn.brand },
  de: { ...de, brand: chromeDe.brand },
};
