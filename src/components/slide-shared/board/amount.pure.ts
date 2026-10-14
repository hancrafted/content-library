import type { Locale } from '@/lib/locale.pure';

/** One amount as a board writes it: in full, and compact for a narrow note. */
export interface FormattedAmount {
  readonly full: string;
  readonly compact: string;
}

/** How an amount is written: in which currency and locale, and whether it carries a sign. */
export interface AmountOptions {
  /** An ISO 4217 code, such as `USD`. */
  readonly currency: string;
  readonly locale: Locale;
  /** Revenue, money coming in: a plus before a positive amount ("+$1M", "+50k $"). */
  readonly signed?: boolean;
}

const THOUSAND = 1_000;
const MILLION = 1_000_000;

/**
 * German thousands as "100k $": Intl's compact notation leaves them in full ("100.000 $"), which a phone-width note
 * cannot hold. The `k` goes right after the number.
 */
function germanThousands(value: number, currency: string, signDisplay: 'auto' | 'exceptZero'): string {
  const parts = new Intl.NumberFormat('de', {
    style: 'currency',
    currency,
    signDisplay,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).formatToParts(value / THOUSAND);
  const types = parts.map(({ type }) => type);
  const lastNumber = Math.max(types.lastIndexOf('integer'), types.lastIndexOf('fraction'));
  return parts.map((part, index) => (index === lastNumber ? `${part.value}k` : part.value)).join('');
}

/**
 * An amount of money in the page's locale, whole units only: in full ("$1,000,000", "1.000.000 $") and compact
 * ("$1M", "$100K", "1 Mio. $", "100k $"), which a board shows below `sm`. `signed` writes a plus before a
 * positive amount in both forms, as revenue reads.
 */
export function formatAmount(value: number, { currency, locale, signed = false }: AmountOptions): FormattedAmount {
  const signDisplay = signed ? 'exceptZero' : 'auto';
  const full = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0, signDisplay });
  const magnitude = Math.abs(value);
  const compact =
    locale === 'de' && magnitude >= THOUSAND && magnitude < MILLION
      ? germanThousands(value, currency, signDisplay)
      : new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', signDisplay }).format(value);
  return { full: full.format(value), compact };
}
