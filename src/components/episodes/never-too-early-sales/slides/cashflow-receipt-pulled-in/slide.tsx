import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard, CashflowMonth, CashflowPaper } from '@/components/slide-shared/cashflow-board';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import styles from './cashflow-receipt-pulled-in.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * basic-page's frame and rhythm (title, caption, then the body pushed down),
 * composed as a Scene so the shared cashflow board sits outside a prose
 * paragraph. The board is the first Section's, with one assumption changed:
 * the $1,000,000 receipt arrives in February. The moved receipt is the one
 * primary focus; once the Slide is active the lane grows and the receipt
 * travels in from April. At rest, off active and under reduced motion the
 * finished board shows, every balance readable.
 */

type Amount =
  'hundredThousand' | 'fiftyThousand' | 'zero' | 'million' | 'nineHundredFiftyThousand' | 'nineHundredThousand';

export const cashflowReceiptPulledIn = slide({
  slug: 'cashflow-receipt-pulled-in',
  messages: { en, de },
  notes: [
    {
      slug: 'a-prepayment-reverses-the-receipt-lag',
      target: 'moved-receipt',
      sources: [
        {
          slug: 'eu-regulation-2016-1905',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1905',
        },
      ],
    },
    {
      slug: 'deferred-payment-carries-liquidity-risk',
      target: 'original-receipt',
      sources: [
        {
          slug: 'eu-directive-2011-7',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011L0007',
        },
      ],
    },
  ],
  segments: [
    { slug: 'move-cash-not-the-signature' },
    { slug: 'check-februarys-arithmetic' },
    { slug: 'ask-what-could-make-receipt-earlier' },
    { slug: 'keep-the-backup-question-open' },
    { slug: 'find-the-work-before-the-payment' },
  ],
  content: ({ t, ref, target, Title }) => {
    const amount = (key: Amount) => t(`board.amounts.${key}`);
    const paper = (label: 'opening' | 'costs' | 'receipts' | 'closing', key: Amount) => (
      <CashflowPaper label={t(`board.${label}`)} amount={amount(key)} />
    );
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        <div className="mt-auto pt-10">
          <CashflowBoard
            label={t('board.label')}
            rule={t('board.rule')}
            above={
              <div className="flex flex-col gap-3">
                <CashflowPaper
                  label={t('board.counterfactual')}
                  state="counterfactual"
                  target={{ 'data-target': 'counterfactual' }}
                />
                <div aria-hidden="true" className={styles.lane}>
                  <div className={`${styles.track} flex min-w-0 items-center gap-2 text-primary`}>
                    <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
                    <span className="min-w-4 flex-1 border-t-2 border-primary" />
                    <span className="text-caption text-pretty text-foreground">{t('board.move')}</span>
                  </div>
                </div>
              </div>
            }
            below={
              <p data-target="warning" role="note" className={`${styles.warning} flex gap-2 border-l-2 pl-3`}>
                <TriangleAlert aria-hidden="true" className={`${styles.warningMark} mt-1 size-4 shrink-0`} />
                <span className="text-body text-pretty text-foreground">{t('warning')}</span>
              </p>
            }
          >
            <CashflowMonth name={t('board.months.january')}>
              {paper('opening', 'hundredThousand')}
              {paper('costs', 'fiftyThousand')}
              {paper('receipts', 'zero')}
              {paper('closing', 'fiftyThousand')}
            </CashflowMonth>
            <CashflowMonth name={t('board.months.february')} badge={t('board.change')}>
              {paper('opening', 'fiftyThousand')}
              <CashflowPaper
                label={t('board.customerReceipt')}
                amount={amount('million')}
                tone="primary"
                className={styles.moved}
                target={target('moved-receipt')}
              >
                {t.rich('board.movedFrom', { ref: ref('a-prepayment-reverses-the-receipt-lag') })}
              </CashflowPaper>
              {paper('costs', 'fiftyThousand')}
              {paper('closing', 'million')}
            </CashflowMonth>
            <CashflowMonth name={t('board.months.march')}>
              {paper('opening', 'million')}
              {paper('costs', 'fiftyThousand')}
              {paper('receipts', 'zero')}
              {paper('closing', 'nineHundredFiftyThousand')}
            </CashflowMonth>
            <CashflowMonth name={t('board.months.april')}>
              {paper('opening', 'nineHundredFiftyThousand')}
              <CashflowPaper
                label={t.rich('board.originalReceipt', { ref: ref('deferred-payment-carries-liquidity-risk') })}
                state="vacated"
                target={target('original-receipt')}
              >
                {t('board.movedTo')}
              </CashflowPaper>
              {paper('costs', 'fiftyThousand')}
              {paper('closing', 'nineHundredThousand')}
            </CashflowMonth>
          </CashflowBoard>
        </div>
      </SlideFrame>
    );
  },
});
