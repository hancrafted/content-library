import { DEFAULT_LOCALE, isLocale } from '@/shared/lib/locale.pure';
import { getRequestConfig } from 'next-intl/server';
import { TRANSLATIONS } from './translations';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale);
  const resolved = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return {
    locale: resolved,
    messages: TRANSLATIONS[resolved],
    onError(error) {
      throw error;
    },
  };
});
