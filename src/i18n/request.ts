import { DEFAULT_LOCALE, isLocale } from '@/lib/locale.pure';
import { getRequestConfig } from 'next-intl/server';
import { CATALOGS } from './catalogs';

/**
 * next-intl's per-render config. Callers pass the locale explicitly
 * (`getTranslations({ locale })`), since a static export has no middleware to
 * read it from. Any formatting or missing-message error throws, so an
 * untranslated string fails the build instead of shipping.
 */
export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale);
  const resolved = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return {
    locale: resolved,
    messages: CATALOGS[resolved],
    onError(error) {
      throw error;
    },
  };
});
