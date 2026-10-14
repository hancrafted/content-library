import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { pipelineByTheNumbers } from './slides/pipeline-by-the-numbers/slide';
import { salesIsMoreThanSelling } from './slides/sales-is-more-than-selling/slide';
import { startBeforeYouNeedTheMoney } from './slides/start-before-you-need-the-money/slide';
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
 * Five Sections, one per Dossier h2. Each later ticket replaces its Section's comment with that Section's list,
 * `[sectionSlide, ...pageSlides]`, and adds one import per Slide.
 */
export const neverTooEarlySalesRun2 = episode({
  slug: 'never-too-early-sales-run-2',
  messages: { en, de },
  sections: [
    [whyWatchingCashflowIsMissionCritical, watchYourCashflow],

    [whySalesIsMoreThanJustSelling, salesIsMoreThanSelling],

    // Section 3, #176: how-to-start-doing-sales

    [whyBuildingAnEffectiveSalesPipelineTakesTime, whatIsASalesPipeline, pipelineByTheNumbers, whyItTakesTimeToRampUp],

    [startBeforeYouNeedTheMoney, watchYourCashflowStartWhen],
  ],
});
