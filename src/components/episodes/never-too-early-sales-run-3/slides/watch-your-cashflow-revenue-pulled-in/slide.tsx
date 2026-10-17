import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import {
  CashflowBoard,
  cashLeft,
  CashLeft,
  type CashflowColumn,
} from '@/components/slide-shared/cashflow-board/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

const DEFAULT_ALIVE = { slug: 'default-alive', url: 'https://paulgraham.com/aord.html' };

const MARCH = 'march';

/**
 * The cashflow board once more (Spec Option 6a): the same notes as the first board, with the million moved from April
 * into March beside the cost, ringed, a dashed outline left where it was and a `primary` arrow labelled "one month
 * earlier".
 */
export const watchYourCashflowRevenuePulledIn = slide({
  slug: 'watch-your-cashflow-revenue-pulled-in',
  messages: { en, de },
  notes: [{ slug: 'predicted-revenue-is-discounted', target: MARCH, sources: [DEFAULT_ALIVE] }],
  segments: [{ slug: 'callback' }, { slug: 'timing-not-amount' }, { slug: 'how-it-moves' }],
  content: ({ t, target, locale }) => {
    const months: CashflowColumn[] = [
      {
        label: t('board.months.jan'),
        notes: [
          { kind: 'cash', amount: 100000 },
          { kind: 'cost', amount: 50000 },
          { kind: 'cash', amount: 50000 },
        ],
      },
      {
        label: t('board.months.feb'),
        notes: [
          { kind: 'cash', amount: 50000 },
          { kind: 'cost', amount: 50000 },
          { kind: 'cash', amount: 0, big: true },
        ],
      },
      {
        label: t('board.months.march'),
        notes: [
          { kind: 'cost', amount: 50000 },
          { kind: 'revenue', amount: 1000000, big: true, ring: true, target: target(MARCH)['data-target'] },
          null,
        ],
      },
      { label: t('board.months.april'), notes: [null, { kind: 'ghost', big: true }, null] },
    ];
    const balances = cashLeft(months);
    const columns = months.map((month, index) => ({
      ...month,
      footer: <CashLeft label={t('board.cashLeft')} amount={balances[index]} locale={locale} />,
    }));
    return (
      <SlideFrame className="mt-10 gap-10">
        <CashflowBoard
          columns={columns}
          labels={{
            board: t('board.label'),
            cash: t('board.note.cash'),
            cost: t('board.note.cost'),
            revenue: t('board.note.revenue'),
            ghost: t('board.ghost'),
          }}
          locale={locale}
          arrow={{ from: [4, 2], to: [3, 2], label: t('board.arrow'), variant: 'curve' }}
        />
      </SlideFrame>
    );
  },
});
