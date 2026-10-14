import type { Locale } from '@/lib/locale.pure';

/** One amount as a board writes it: in full, and compact for a narrow note. */
export interface FormattedAmount {
  readonly full: string;
  readonly compact: string;
}

/**
 * An amount of money in the page's locale, whole units only: in full ("$1,000,000", "1.000.000 $") and in the
 * locale's compact notation ("$1M", "1 Mio. $"), which a board shows below `sm`.
 */
export function formatAmount(value: number, currency: string, locale: Locale): FormattedAmount {
  const full = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
  const compact = new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact' });
  return { full: full.format(value), compact: compact.format(value) };
}
