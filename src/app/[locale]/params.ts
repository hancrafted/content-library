import { isLocale, PREFIXED_LOCALES, type Locale } from '@/lib/locale.pure';
import { notFound } from 'next/navigation';

export interface LocaleParams {
  params: Promise<{ locale: string }>;
}

/** Only the prefixed locales are built under `[locale]`; the default locale lives at the root. */
export function prefixedLocaleParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export async function resolveLocale(params: LocaleParams['params']): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale) || !PREFIXED_LOCALES.includes(locale)) notFound();
  return locale;
}
