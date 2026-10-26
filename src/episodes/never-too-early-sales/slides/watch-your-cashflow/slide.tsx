import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import {
  CashflowBoard,
  cashLeft,
  CashLeft,
  type CashflowColumn,
} from '@/episodes/components/slide-shared/cashflow-board/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

const STARTUP_FUNDING = { slug: 'startup-funding', url: 'https://www.paulgraham.com/startupfunding.html' };
const DEFAULT_ALIVE = { slug: 'default-alive', url: 'https://paulgraham.com/aord.html' };

/**
 * The cashflow board, January to April: two months of cash run out in February, March's cost lands on an empty
 * account under a Bankrupt stamp, and the million arrives in April, one month late. Each column's Cash left footer
 * states its balance, so no cash note repeats it. The March lane is ringed and two brackets read the timing; Context
 * markers sit in the March lane, after "Two months of cash" and beside February's Cash left.
 */
export const watchYourCashflow = slide({
  slug: 'watch-your-cashflow',
  messages: { en, de },
  notes: [
    { slug: 'costs-begin-before-customers', target: 'title', sources: [STARTUP_FUNDING] },
    { slug: 'high-burn-rate-is-a-clock', target: 'title', sources: [STARTUP_FUNDING] },
    { slug: 'default-alive-test', target: 'zero-cash', sources: [DEFAULT_ALIVE] },
  ],
  segments: [
    { slug: 'walk-the-months' },
    { slug: 'march-has-no-money' },
    { slug: 'antithesis' },
    { slug: 'hand-over-the-verdict' },
  ],
  content: ({ t, target, locale, marker, Marker }) => {
    const months: CashflowColumn[] = [
      {
        label: t('months.jan'),
        notes: [{ kind: 'cash', amount: 100000 }, { kind: 'cost', amount: 50000 }, null],
      },
      {
        label: t('months.feb'),
        notes: [{ kind: 'cash', amount: 50000 }, { kind: 'cost', amount: 50000 }, null],
      },
      {
        label: t('months.mar'),
        notes: [{ kind: 'cost', amount: 50000 }, null, null],
        marker: <Marker note="costs-begin-before-customers" />,
      },
      { label: t('months.apr'), notes: [null, { kind: 'revenue', amount: 1000000, big: true }, null] },
    ];
    const balances = cashLeft(months);
    // February's footer states the €0 the board turns on, so it carries the zero-cash target and its marker.
    const zero = {
      target: target('zero-cash')['data-target'],
      marker: <Marker note="default-alive-test" placement="beside" />,
    };
    const columns = months.map((month, index) => ({
      ...month,
      footer: <CashLeft label={t('cashLeft')} amount={balances[index]} locale={locale} {...(index === 1 && zero)} />,
    }));
    return (
      <SlideFrame className="mt-10 gap-10">
        <CashflowBoard
          columns={columns}
          labels={{ board: t('board'), cash: t('note.cash'), cost: t('note.cost'), revenue: t('note.revenue') }}
          locale={locale}
          stamp={{ label: t('stamp'), column: 3 }}
          highlight={3}
          annotations={[
            {
              column: 1,
              span: 2,
              kind: 'bracket',
              text: t.rich('runway', { marker: marker('high-burn-rate-is-a-clock') }),
            },
            { column: 3, span: 2, kind: 'bracket', text: t('late') },
          ]}
        />
      </SlideFrame>
    );
  },
});
