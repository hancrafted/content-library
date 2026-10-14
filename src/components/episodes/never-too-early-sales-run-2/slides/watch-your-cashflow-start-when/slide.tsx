import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard, type CashColumn } from '@/components/slide-shared/board/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './watch-your-cashflow-start-when.module.css';

/*
 * The third cashflow board: one column per quarter, Q1 to Q4. Cash runs to $0 by the end of Q2, revenue lands only
 * from Q3, and an arrow runs back from Q3's revenue through Q2's empty revenue slot to Q1, the column where you
 * start, outlined in primary. A Scene in place of the Dossier's basic page (the ticket's overrule): the board is the
 * body, and a paragraph cannot hold a grid.
 */
export const watchYourCashflowStartWhen = slide({
  slug: 'watch-your-cashflow-start-when',
  messages: { en, de },
  notes: [
    {
      slug: 'worry-early',
      target: 'arrow',
      sources: [{ slug: 'default-alive-or-default-dead', url: 'https://paulgraham.com/aord.html' }],
    },
  ],
  segments: [{ slug: 'start-when' }, { slug: 'learning-goal' }, { slug: 'your-four-steps' }, { slug: 'this-week' }],
  content: ({ t, locale, target, Title }) => {
    const cash = t('board.kinds.cash');
    const cost = t('board.kinds.cost');
    const revenue = t('board.kinds.revenue');
    const columns: readonly CashColumn[] = [
      {
        slug: 'q1',
        label: t('board.quarters.q1'),
        primary: true,
        notes: [
          { slug: 'q1-opening', slot: 'opening', label: cash, amount: 100_000 },
          { slug: 'q1-cost', slot: 'cost', label: cost, amount: 50_000 },
          { slug: 'q1-closing', slot: 'closing', label: cash, amount: 50_000 },
        ],
      },
      {
        slug: 'q2',
        label: t('board.quarters.q2'),
        notes: [
          { slug: 'q2-opening', slot: 'opening', label: cash, amount: 50_000 },
          { slug: 'q2-cost', slot: 'cost', label: cost, amount: 50_000 },
          { slug: 'q2-closing', slot: 'closing', label: cash, amount: 0, zeroCash: true },
        ],
      },
      {
        slug: 'q3',
        label: t('board.quarters.q3'),
        notes: [
          { slug: 'q3-cost', slot: 'cost', label: cost, amount: 50_000 },
          { slug: 'q3-revenue', slot: 'revenue', label: revenue, amount: 50_000 },
        ],
      },
      {
        slug: 'q4',
        label: t('board.quarters.q4'),
        notes: [
          { slug: 'q4-cost', slot: 'cost', label: cost, amount: 50_000 },
          { slug: 'q4-revenue', slot: 'revenue', label: revenue, amount: 50_000 },
        ],
      },
    ];
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <div className="mt-10">
          <CashflowBoard
            columns={columns}
            locale={locale}
            currency="USD"
            arrow={{ from: 3, to: 1, slot: 'revenue', label: t('board.arrow'), target: target('arrow') }}
            noteClassName={styles.note}
            arrowClassName={styles.arrow}
          />
        </div>
      </SlideFrame>
    );
  },
});
