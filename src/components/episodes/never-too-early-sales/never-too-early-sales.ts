import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { pipelineByTheNumbers } from './slides/pipeline-by-the-numbers/slide';
import { watchYourCashflow } from './slides/watch-your-cashflow/slide';
import { whatIsASalesPipeline } from './slides/what-is-a-sales-pipeline/slide';
import { whyBuildingAnEffectiveSalesPipelineTakesTime } from './slides/why-building-an-effective-sales-pipeline-takes-time/slide';
import { whyItTakesTimeToRampUp } from './slides/why-it-takes-time-to-ramp-up/slide';
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
    [whyBuildingAnEffectiveSalesPipelineTakesTime, whatIsASalesPipeline, pipelineByTheNumbers, whyItTakesTimeToRampUp],
  ],
});
