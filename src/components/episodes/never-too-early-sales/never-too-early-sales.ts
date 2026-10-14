import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { cashflowReceiptPulledIn } from './slides/cashflow-receipt-pulled-in/slide';
import { cashflowStartWhen } from './slides/cashflow-start-when/slide';
import { howToStartSales } from './slides/how-to-start-sales/slide';
import { marketingFeedsThePipeline } from './slides/marketing-feeds-the-pipeline/slide';
import { pipelineByTheNumbers } from './slides/pipeline-by-the-numbers/slide';
import { pipelineToolsInPractice } from './slides/pipeline-tools-in-practice/slide';
import { salesBeyondSelling } from './slides/sales-beyond-selling/slide';
import { salesIsMoreThanSelling } from './slides/sales-is-more-than-selling/slide';
import { stagesOfAfterSale } from './slides/stages-of-after-sale/slide';
import { stagesOfSale } from './slides/stages-of-sale/slide';
import { watchYourCashflow } from './slides/watch-your-cashflow/slide';
import { whatIsASalesPipeline } from './slides/what-is-a-sales-pipeline/slide';
import { whyCashflowMatters } from './slides/why-cashflow-matters/slide';
import { whyPipelineTakesTime } from './slides/why-pipeline-takes-time/slide';
import { whyRampUpTakesTime } from './slides/why-ramp-up-takes-time/slide';

/*
 * "Why it's never too early to start with sales", an Upcoming Episode. English
 * is its approved Dossier's text; every German file holds the same English
 * strings as a provisional fallback until the German translation after
 * Promotion. One import and one list entry per Slide, in Dossier order.
 */
export const neverTooEarlySales = episode({
  slug: 'never-too-early-sales',
  messages: { en, de },
  sections: [
    [whyCashflowMatters, watchYourCashflow],
    [salesBeyondSelling, salesIsMoreThanSelling],
    [howToStartSales, stagesOfSale, stagesOfAfterSale, cashflowReceiptPulledIn],
    [
      whyPipelineTakesTime,
      whatIsASalesPipeline,
      pipelineByTheNumbers,
      pipelineToolsInPractice,
      marketingFeedsThePipeline,
      whyRampUpTakesTime,
      cashflowStartWhen,
    ],
  ],
});
