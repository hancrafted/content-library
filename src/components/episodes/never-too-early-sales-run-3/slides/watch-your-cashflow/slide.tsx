import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import {
  CashflowBoard,
  cashLeft,
  CashLeft,
  type CashflowColumn,
} from '@/components/slide-shared/cashflow-board/cashflow-board';
import { cn } from '@/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './watch-your-cashflow.module.css';

const STARTUP_FUNDING = { slug: 'startup-funding', url: 'https://www.paulgraham.com/startupfunding.html' };
const DEFAULT_ALIVE = { slug: 'default-alive', url: 'https://paulgraham.com/aord.html' };

/**
 * The cashflow board, January to April: two months of cash run out in February, March's cost lands on an empty
 * account under a Bankrupt stamp, and the million arrives in April, one month late. The March lane is ringed, two
 * brackets read the timing, and the closing question is pinned under the board. Notes are placed one at a time in
 * reading order while the Slide is active.
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
  content: ({ t, target, locale }) => {
    const months: CashflowColumn[] = [
      {
        label: t('months.jan'),
        notes: [
          { kind: 'cash', amount: 100000 },
          { kind: 'cost', amount: 50000 },
          { kind: 'cash', amount: 50000 },
        ],
      },
      {
        label: t('months.feb'),
        notes: [
          { kind: 'cash', amount: 50000 },
          { kind: 'cost', amount: 50000 },
          { kind: 'cash', amount: 0, big: true, target: target('zero-cash')['data-target'] },
        ],
      },
      { label: t('months.mar'), notes: [{ kind: 'cost', amount: 50000 }, null, null] },
      { label: t('months.apr'), notes: [null, { kind: 'revenue', amount: 1000000, big: true }, null] },
    ];
    const balances = cashLeft(months);
    const columns = months.map((month, index) => ({
      ...month,
      footer: <CashLeft label={t('cashLeft')} amount={balances[index]} locale={locale} />,
    }));
    return (
      <SlideFrame className={cn(styles.scene, 'gap-10')}>
        <CashflowBoard
          columns={columns}
          labels={{ board: t('board'), cash: t('note.cash'), cost: t('note.cost'), revenue: t('note.revenue') }}
          locale={locale}
          stamp={{ label: t('stamp'), column: 3 }}
          highlight={3}
          annotations={[
            { column: 1, span: 2, kind: 'bracket', text: t('runway') },
            { column: 3, span: 2, kind: 'bracket', text: t('late') },
          ]}
        />
        <aside className={cn(styles.question, 'rotate-1 self-end border bg-card p-6 shadow-md lg:w-5/12')}>
          <p className="font-mono text-caption tracking-widest text-muted-foreground uppercase">
            {t('question.label')}
          </p>
          <p className="mt-2 text-body font-semibold">{t('question.text')}</p>
        </aside>
      </SlideFrame>
    );
  },
});
