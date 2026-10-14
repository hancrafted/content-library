import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { howMarketingFeedsThePipeline } from './slides/how-marketing-feeds-the-pipeline/slide';
import { howToStartDoingSales } from './slides/how-to-start-doing-sales/slide';
import { pipelineByTheNumbers } from './slides/pipeline-by-the-numbers/slide';
import { pipelineToolsInPractice } from './slides/pipeline-tools-in-practice/slide';
import { salesIsMoreThanSelling } from './slides/sales-is-more-than-selling/slide';
import { stagesOfSale } from './slides/stages-of-sale/slide';
import { startBeforeYouNeedTheMoney } from './slides/start-before-you-need-the-money/slide';
import { watchYourCashflowRevenuePulledIn } from './slides/watch-your-cashflow-revenue-pulled-in/slide';
import { watchYourCashflowStartWhen } from './slides/watch-your-cashflow-start-when/slide';
import { watchYourCashflow } from './slides/watch-your-cashflow/slide';
import { whatIsASalesPipeline } from './slides/what-is-a-sales-pipeline/slide';
import { whyBuildingAnEffectiveSalesPipelineTakesTime } from './slides/why-building-an-effective-sales-pipeline-takes-time/slide';
import { whyItTakesTimeToRampUp } from './slides/why-it-takes-time-to-ramp-up/slide';
import { whySalesIsMoreThanJustSelling } from './slides/why-sales-is-more-than-just-selling/slide';
import { whyWatchingCashflowIsMissionCritical } from './slides/why-watching-cashflow-is-mission-critical/slide';

/*
 * "Start selling before you need the money": revenue arrives months after the costs that create it, so by the time
 * you feel you need sales it is already too late. Built from the Dossier under
 * docs/episodes/never-too-early-sales-run-2/; each Slide is one folder under `slides/`, named after its Dossier
 * heading id. Upcoming until its video is live.
 *
 * Five Sections, one per Dossier h2, each `[sectionSlide, ...pageSlides]`.
 */
export const neverTooEarlySalesRun2 = episode({
  slug: 'never-too-early-sales-run-2',
  messages: { en, de },
  sections: [
    [whyWatchingCashflowIsMissionCritical, watchYourCashflow],

    [whySalesIsMoreThanJustSelling, salesIsMoreThanSelling],

    [
      howToStartDoingSales,
      stagesOfSale,
      pipelineToolsInPractice,
      howMarketingFeedsThePipeline,
      watchYourCashflowRevenuePulledIn,
    ],

    [whyBuildingAnEffectiveSalesPipelineTakesTime, whatIsASalesPipeline, pipelineByTheNumbers, whyItTakesTimeToRampUp],

    [startBeforeYouNeedTheMoney, watchYourCashflowStartWhen],
  ],
});
