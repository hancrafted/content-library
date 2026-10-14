import type { Locale } from '@/lib/locale.pure';

/** One amount as a board writes it: in full, and compact for a narrow note. */
export interface FormattedAmount {
  readonly full: string;
  readonly compact: string;
}

const THOUSAND = 1_000;
const MILLION = 1_000_000;

/**
 * German thousands as "100k $": Intl's compact notation leaves them in full ("100.000 $"), which a phone-width note
 * cannot hold. The `k` goes right after the number.
 */
function germanThousands(value: number, currency: string): string {
  const parts = new Intl.NumberFormat('de', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).formatToParts(value / THOUSAND);
  const types = parts.map(({ type }) => type);
  const lastNumber = Math.max(types.lastIndexOf('integer'), types.lastIndexOf('fraction'));
  return parts.map((part, index) => (index === lastNumber ? `${part.value}k` : part.value)).join('');
}

/**
 * An amount of money in the page's locale, whole units only: in full ("$1,000,000", "1.000.000 $") and compact
 * ("$1M", "$100K", "1 Mio. $", "100k $"), which a board shows below `sm`.
 */
export function formatAmount(value: number, currency: string, locale: Locale): FormattedAmount {
  const full = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
  const magnitude = Math.abs(value);
  const compact =
    locale === 'de' && magnitude >= THOUSAND && magnitude < MILLION
      ? germanThousands(value, currency)
      : new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact' }).format(value);
  return { full: full.format(value), compact };
}
