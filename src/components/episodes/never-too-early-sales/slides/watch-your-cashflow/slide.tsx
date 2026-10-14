import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard, CashflowMonth, CashflowPaper, CashflowStamp } from '@/components/slide-shared/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './watch-your-cashflow.module.css';

/*
 * basic-page's frame and rhythm (title, caption, then the body pushed down),
 * composed as a Scene so the board's month cards sit outside a prose
 * paragraph. The stamp settles in when the Slide becomes active; at rest,
 * off active and under reduced motion the finished board shows.
 */

export const watchYourCashflow = slide({
  slug: 'watch-your-cashflow',
  messages: { en, de },
  notes: [
    {
      slug: 'recognition-has-its-own-trigger',
      target: 'basis',
      sources: [
        {
          slug: 'eu-regulation-2016-1905',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1905',
        },
      ],
    },
    {
      slug: 'expenses-and-payments-can-differ-too',
      target: 'rule',
      sources: [{ slug: 'irs-publication-538', url: 'https://www.irs.gov/publications/p538' }],
    },
  ],
  segments: [
    { slug: 'count-january-first' },
    { slug: 'zero-is-the-warning' },
    { slug: 'a-signature-cannot-pay-payroll' },
    { slug: 'build-your-own-monthly-view' },
    { slug: 'mark-the-zero-cash-month' },
    { slug: 'do-not-wait-for-the-alarm' },
  ],
  content: ({ t, ref, target, Title }) => {
    const amount = (key: 'hundredThousand' | 'fiftyThousand' | 'zero' | 'million') => t(`board.amounts.${key}`);
    const costs = <CashflowPaper label={t('board.costs')} amount={amount('fiftyThousand')} />;
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        <div className="mt-auto pt-10">
          <CashflowBoard
            label={t.rich('board.label', { recognition: ref('recognition-has-its-own-trigger') })}
            labelTarget={target('basis')}
            rule={t.rich('board.rule', { payments: ref('expenses-and-payments-can-differ-too') })}
            ruleTarget={target('rule')}
            below={
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <CashflowStamp className={styles.stamp}>{t('board.stamp')}</CashflowStamp>
                  <p className="text-caption text-muted-foreground">{t('board.shorthand')}</p>
                </div>
                <CashflowPaper label={t('board.ifFunded')} state="counterfactual" />
              </>
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
      </SlideFrame>
    );
  },
});
