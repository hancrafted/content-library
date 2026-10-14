import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { howMarketingFeedsThePipeline } from './slides/how-marketing-feeds-the-pipeline/slide';
import { howToStartDoingSales } from './slides/how-to-start-doing-sales/slide';
import { pipelineToolsInPractice } from './slides/pipeline-tools-in-practice/slide';
import { stagesOfSale } from './slides/stages-of-sale/slide';
import { watchYourCashflowRevenuePulledIn } from './slides/watch-your-cashflow-revenue-pulled-in/slide';
import { watchYourCashflow } from './slides/watch-your-cashflow/slide';
import { whyWatchingCashflowIsMissionCritical } from './slides/why-watching-cashflow-is-mission-critical/slide';

/*
 * "Start selling before you need the money" (spec #147). One Section per
 * Dossier h2, each opening on its section slide. A later Slide is one folder
 * under `slides/`, one import above and one list entry below.
 */
export const neverTooEarlySales = episode({
  slug: 'never-too-early-sales',
  messages: { en, de },
  sections: [
    [whyWatchingCashflowIsMissionCritical, watchYourCashflow],
    [
      howToStartDoingSales,
      stagesOfSale,
      pipelineToolsInPractice,
      howMarketingFeedsThePipeline,
      watchYourCashflowRevenuePulledIn,
    ],
  ],
});
