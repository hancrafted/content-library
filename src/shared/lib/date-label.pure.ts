import type { Locale } from './locale.pure';

export function dateLabelOf(day: string, locale: Locale): string {
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return format.format(new Date(`${day}T00:00:00Z`));
}

export function monthLabelOf(month: string, locale: Locale): string {
  const format = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return format.format(new Date(`${month}-01T00:00:00Z`));
}

export function weekdayLabelOf(day: string, locale: Locale): string {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  return format.format(new Date(`${day}T00:00:00Z`));
}
