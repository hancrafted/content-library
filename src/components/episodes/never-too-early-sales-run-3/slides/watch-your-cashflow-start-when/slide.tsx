import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import {
  CashflowBoard,
  cashLeft,
  CashLeft,
  type CashflowColumn,
} from '@/components/slide-shared/cashflow-board/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './slide.module.css';
import { StartSteps, STEP_SLUGS } from './start-steps';

const STARTUP_FUNDING = { slug: 'startup-funding', url: 'https://www.paulgraham.com/startupfunding.html' };

/** A dashed drop from the Q1 lane down to the steps, with the line that ties them. */
function Drop({ text }: { text: string }) {
  return (
    <div className="grid grid-cols-2 items-center gap-x-3 px-3 @min-[38rem]:grid-cols-4 @min-[38rem]:gap-x-6 @min-[38rem]:px-8">
      <div className="flex justify-center">
        <svg viewBox="0 0 40 64" className="h-16 w-10" aria-hidden="true">
          <path d="M20 2 V50" className="stroke-muted-foreground" strokeWidth="3" strokeDasharray="6 6" />
          <path
            d="M8 44 L20 58 L32 44"
            className="fill-none stroke-muted-foreground"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-mono text-caption text-muted-foreground @min-[38rem]:col-span-3">{text}</p>
    </div>
  );
}

/**
 * The cashflow board a third time, by quarter: cash hits zero in Q2 and revenue only lands in Q3, so a `primary`
 * arrow drags it back to the ringed Q1 lane, "Start early!". Under the board, a dashed drop from Q1 leads to a lane of
 * this week's four steps. The arrow sweeps in, the ring fades in, then the steps are placed one at a time.
 */
export const watchYourCashflowStartWhen = slide({
  slug: 'watch-your-cashflow-start-when',
  messages: { en, de },
  notes: [{ slug: 'even-a-yes-arrives-late', target: 'q2-cash-zero', sources: [STARTUP_FUNDING] }],
  segments: [
    { slug: 'third-time-new-question' },
    { slug: 'the-arrow-points-at-q1' },
    { slug: 'four-steps' },
    { slug: 'honest-caveat' },
    { slug: 'hand-over-the-verdict' },
  ],
  content: ({ t, Title, target, locale }) => {
    const spent = { kind: 'cost', amount: 50000 } as const;
    const earned = { kind: 'revenue', amount: 50000 } as const;
    const quarters: CashflowColumn[] = [
      {
        label: t('quarters.q1'),
        notes: [{ kind: 'cash', amount: 100000 }, spent, { kind: 'cash', amount: 50000 }],
      },
      {
        label: t('quarters.q2'),
        notes: [
          { kind: 'cash', amount: 50000 },
          spent,
          { kind: 'cash', amount: 0, big: true, target: target('q2-cash-zero')['data-target'] },
        ],
      },
      { label: t('quarters.q3'), notes: [spent, earned, null] },
      { label: t('quarters.q4'), notes: [spent, earned, null] },
    ];
    const balances = cashLeft(quarters);
    const columns = quarters.map((quarter, index) => ({
      ...quarter,
      footer: <CashLeft label={t('cashLeft')} amount={balances[index]} locale={locale} />,
    }));
    const steps = STEP_SLUGS.map((slug) => ({
      slug,
      title: t(`steps.${slug}.title`),
      detail: t(`steps.${slug}.detail`),
    }));
    return (
      <SlideFrame className={styles.scene}>
        <header>
          <p className="font-mono text-caption tracking-widest text-muted-foreground uppercase">{t('kicker')}</p>
          <div className="mt-3">
            <Title>{t('title')}</Title>
          </div>
          <SlideCaption>{t('caption')}</SlideCaption>
        </header>
        <div className="mt-12 flex flex-col gap-4 @container">
          <CashflowBoard
            columns={columns}
            labels={{ board: t('board'), cash: t('note.cash'), cost: t('note.cost'), revenue: t('note.revenue') }}
            locale={locale}
            highlight={1}
            arrow={{ from: [3, 2], to: [1, 2], label: t('arrow') }}
          />
          <Drop text={t('link')} />
          <div className="mt-4">
            <StartSteps label={t('steps.label')} steps={steps} />
          </div>
        </div>
      </SlideFrame>
    );
  },
});
