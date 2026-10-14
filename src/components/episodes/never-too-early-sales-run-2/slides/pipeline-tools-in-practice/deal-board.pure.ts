import { formatAmount } from '@/components/slide-shared/board/amount.pure';
import type { Locale } from '@/lib/locale.pure';

/** The deal board's five stages, left to right. */
export const DEAL_COLUMNS = [
  'lead-in',
  'contact-made',
  'needs-defined',
  'proposal-made',
  'negotiations-started',
] as const;

export type DealColumn = (typeof DEAL_COLUMNS)[number];

/** One deal on the board: a fictional company and its value in whole US dollars. */
export interface Deal {
  readonly slug: string;
  readonly column: DealColumn;
  readonly company: string;
  readonly amount: number;
  /** The one deal that just moved a stage forward. */
  readonly moved?: boolean;
}

/** The board's deals in reading order, column by column. Fictional companies only; names are not translated. */
export const DEALS: readonly Deal[] = [
  { slug: 'kestrel-logistics', column: 'lead-in', company: 'Kestrel Logistics', amount: 12_000 },
  { slug: 'harbor-dental', column: 'lead-in', company: 'Harbor Dental', amount: 8_500 },
  { slug: 'alder-studio', column: 'lead-in', company: 'Alder Studio', amount: 5_500 },
  { slug: 'meadow-foods', column: 'contact-made', company: 'Meadow Foods', amount: 9_000 },
  { slug: 'pine-street-clinic', column: 'needs-defined', company: 'Pine Street Clinic', amount: 4_000 },
  { slug: 'nordwerk', column: 'proposal-made', company: 'Nordwerk', amount: 18_000, moved: true },
  { slug: 'bluefin-labs', column: 'proposal-made', company: 'Bluefin Labs', amount: 10_000 },
  { slug: 'fennel-and-co', column: 'negotiations-started', company: 'Fennel & Co', amount: 15_000 },
  { slug: 'orbit-print', column: 'negotiations-started', company: 'Orbit Print', amount: 6_500 },
];

/** A deal with its amount written for the page. */
export interface PlacedDeal extends Deal {
  readonly amountText: string;
}

/** One column as the board shows it: its deals, and the total and count computed from them. */
export interface DealColumnView {
  readonly column: DealColumn;
  readonly deals: readonly PlacedDeal[];
  readonly total: number;
  readonly totalText: string;
  readonly count: number;
}

const CURRENCY = 'USD';

/** Every column in board order, its total and count summed from its deals, never written by hand. */
export function dealColumns(deals: readonly Deal[], locale: Locale): readonly DealColumnView[] {
  const write = (amount: number) => formatAmount(amount, CURRENCY, locale).full;
  return DEAL_COLUMNS.map((column) => {
    const own = deals.filter((deal) => deal.column === column);
    const total = own.reduce((sum, deal) => sum + deal.amount, 0);
    return {
      column,
      deals: own.map((deal) => ({ ...deal, amountText: write(deal.amount) })),
      total,
      totalText: write(total),
      count: own.length,
    };
  });
}
