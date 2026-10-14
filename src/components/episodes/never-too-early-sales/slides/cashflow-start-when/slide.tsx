import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard, CashflowMonth, CashflowPaper } from '@/components/slide-shared/cashflow-board';
import { cn } from '@/lib/utils';
import { ActionNotes } from './action-notes';
import styles from './cashflow-start-when.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { QuarterAnnotation } from './quarter-annotation';
import { StartWhenArrow } from './start-when-arrow';

/*
 * basic-page's frame composed as a Scene around the shared cashflow board,
 * returning with the same baseline months. Its `above` row carries this
 * Slide's backwards "Start when?" arrow and the quarter annotation; a
 * counterfactual reminder and the four first actions follow the board. Only
 * the arrow traces in when the Slide becomes active.
 */

const STEPS = ['first-contact', 'opportunities', 'closing', 'april-receipt'] as const;
/** Each quarter and how many of the board's month columns it spans. */
const QUARTERS = [
  { slug: 'q1', span: 3 },
  { slug: 'q2', span: 1 },
] as const;
const ACTIONS = ['zero-cash-month', 'prospect-list', 'first-contact', 'track-pipeline'] as const;

export const cashflowStartWhen = slide({
  slug: 'cashflow-start-when',
  messages: { en, de },
  notes: [
    {
      slug: 'an-unpaid-earned-amount-is-not-spendable-cash',
      target: 'board',
      sources: [
        {
          slug: 'eu-regulation-2016-1905',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1905',
        },
      ],
    },
    {
      slug: 'payment-risk-is-distinct-from-deal-risk',
      target: 'april-receipt',
      sources: [
        {
          slug: 'eu-directive-2011-7',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011L0007',
        },
      ],
    },
  ],
  segments: [
    { slug: 'return-to-the-unfunded-month' },
    { slug: 'plan-backwards-act-forwards' },
    { slug: 'do-not-mix-the-two-illustrations' },
    { slug: 'take-the-cash-action-now' },
    { slug: 'take-the-customer-actions-now' },
    { slug: 'keep-evidence-as-you-go' },
  ],
  content: ({ t, target, Title }) => {
    const amount = (key: 'hundredThousand' | 'fiftyThousand' | 'zero' | 'million') => t(`board.amounts.${key}`);
    const costs = <CashflowPaper label={t('board.costs')} amount={amount('fiftyThousand')} />;
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        <div className={cn(styles.scene, 'mt-auto flex flex-col gap-6 pt-10')}>
          <div {...target('board')}>
            <CashflowBoard
              label={t('board.label')}
              rule={t('board.rule')}
              above={
                <div className="flex flex-col gap-4">
                  <StartWhenArrow
                    question={t('arrow.question')}
                    caveat={t('arrow.caveat')}
                    start={t('arrow.start')}
                    steps={STEPS.map((step) => ({ slug: step, label: t(`arrow.steps.${step}`) }))}
                  />
                  <QuarterAnnotation
                    legend={t('quarters.legend')}
                    quarters={QUARTERS.map(({ slug, span }) => ({ slug, label: t(`quarters.${slug}`), span }))}
                  />
                </div>
              }
            >
              <CashflowMonth name={t('board.months.january')}>
                <CashflowPaper label={t('board.opening')} amount={amount('hundredThousand')} />
                {costs}
                <CashflowPaper label={t('board.receipts')} amount={amount('zero')} />
                <CashflowPaper label={t('board.closing')} amount={amount('fiftyThousand')} />
              </CashflowMonth>
              <CashflowMonth name={t('board.months.february')} badge={t('board.zeroCashMonth')} tone="warning">
                <CashflowPaper label={t('board.opening')} amount={amount('fiftyThousand')} />
                {costs}
                <CashflowPaper label={t('board.receipts')} amount={amount('zero')} />
                <CashflowPaper label={t('board.closing')} amount={amount('zero')} tone="warning" />
              </CashflowMonth>
              <CashflowMonth name={t('board.months.march')}>
                <CashflowPaper label={t('board.costs')} amount={amount('fiftyThousand')} tone="destructive">
                  {t('board.cannotFund')}
                </CashflowPaper>
              </CashflowMonth>
              <CashflowMonth name={t('board.months.april')}>
                {costs}
                <CashflowPaper label={t('board.customerReceipt')} amount={amount('million')} tone="warning">
                  {t('board.tooLate')}
                </CashflowPaper>
              </CashflowMonth>
            </CashflowBoard>
          </div>
          <p
            data-target="reminder"
            className="self-start rounded-md border border-dashed border-border p-3 text-caption text-muted-foreground"
          >
            {t('reminder')}
          </p>
          <ActionNotes actions={ACTIONS.map((action) => ({ slug: action, label: t(`actions.${action}`) }))} />
        </div>
      </SlideFrame>
    );
  },
});
