import type { Locale } from './locale.pure';

/**
 * A calendar day (`YYYY-MM-DD`) as the reader's locale writes it ("Oct 23, 2026", "23. Okt. 2026"), read in UTC so
 * the build machine's time zone never moves it to a neighbouring day. A day that is not a date throws, so the build
 * fails rather than ships a blank.
 */
export function dateLabelOf(day: string, locale: Locale): string {
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return format.format(new Date(`${day}T00:00:00Z`));
}
