import type { Locale } from '@/lib/locale.pure';
import { formatAmount } from './amount.pure';

export interface AmountProps {
  /** Whole units of `currency`. */
  value: number;
  /** The page's locale, which writes the amount. */
  locale: Locale;
  /** An ISO 4217 code, such as `USD`. */
  currency: string;
  /** Revenue, money coming in: a plus before a positive amount. */
  signed?: boolean;
}

/**
 * An amount as a board note writes it: compact below `sm`, so four columns fit a phone, in full from `sm`. A note's
 * `value`, for CashflowBoard's notes and a Slide's own notes over the board alike. A server part with plain props
 * (FE-007 §5.2).
 */
export function Amount({ value, locale, currency, signed = false }: AmountProps) {
  const { full, compact } = formatAmount(value, { locale, currency, signed });
  return (
    <>
      <span data-amount="compact" className="sm:hidden">
        {compact}
      </span>
      <span data-amount="full" className="hidden sm:inline">
        {full}
      </span>
    </>
  );
}
