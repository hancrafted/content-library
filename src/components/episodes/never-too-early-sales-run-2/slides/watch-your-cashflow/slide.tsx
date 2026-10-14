import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard, type CashColumn } from '@/components/slide-shared/board/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './watch-your-cashflow.module.css';

/*
 * The hook's board: one column per month, January to April. Cash runs from $100,000 to $0 by the end of February,
 * March carries a cost with nothing to pay it, so the board is stamped bankrupt, and April's million in revenue sits
 * in a dashed column the company never reaches. A Scene in place of the Dossier's basic page (the ticket's overrule):
 * the board is the body, and a paragraph cannot hold a grid.
 */
export const watchYourCashflow = slide({
  slug: 'watch-your-cashflow',
  messages: { en, de },
  notes: [
    {
      slug: 'costs-come-first',
      target: 'first-cost',
      sources: [{ slug: 'startup-funding', url: 'https://www.paulgraham.com/startupfunding.html' }],
    },
    {
      slug: 'promised-money-arrives-late',
      target: 'revenue',
      sources: [{ slug: 'startup-funding', url: 'https://www.paulgraham.com/startupfunding.html' }],
    },
    {
      slug: 'hiring-ahead-does-not-pay-itself',
      target: 'board',
      sources: [{ slug: 'default-alive-or-default-dead', url: 'https://paulgraham.com/aord.html' }],
    },
  ],
  segments: [
    { slug: 'read-the-board' },
    { slug: 'zero-cash-month' },
    { slug: 'first-actionable' },
    { slug: 'right-deal-wrong-month' },
  ],
  content: ({ t, locale, target, Title }) => {
    const cash = t('board.kinds.cash');
    const cost = t('board.kinds.cost');
    const columns: readonly CashColumn[] = [
      {
        slug: 'january',
        label: t('board.months.january'),
        notes: [
          { slug: 'january-opening', slot: 'opening', label: cash, amount: 100_000 },
          {
            slug: 'january-cost',
            slot: 'cost',
            label: cost,
            amount: 50_000,
            target: target('first-cost'),
          },
          { slug: 'january-closing', slot: 'closing', label: cash, amount: 50_000 },
        ],
      },
      {
        slug: 'february',
        label: t('board.months.february'),
        notes: [
          { slug: 'february-opening', slot: 'opening', label: cash, amount: 50_000 },
          { slug: 'february-cost', slot: 'cost', label: cost, amount: 50_000 },
          {
            slug: 'february-closing',
            slot: 'closing',
            label: cash,
            amount: 0,
            zeroCash: true,
          },
        ],
      },
      {
        slug: 'march',
        label: t('board.months.march'),
        notes: [{ slug: 'march-cost', slot: 'cost', label: cost, amount: 50_000 }],
      },
      {
        slug: 'april',
        label: t('board.months.april'),
        outOfReach: true,
        notes: [
          {
            slug: 'april-revenue',
            slot: 'revenue',
            label: t('board.kinds.revenue'),
            amount: 1_000_000,
            target: target('revenue'),
          },
        ],
      },
    ];
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <div className="mt-10">
          <CashflowBoard
            columns={columns}
            locale={locale}
            currency="USD"
            stamp={{ text: t('board.stamp'), column: 3 }}
            target={target('board')}
            noteClassName={styles.note}
            stampClassName={styles.stamp}
          />
        </div>
      </SlideFrame>
    );
  },
});
