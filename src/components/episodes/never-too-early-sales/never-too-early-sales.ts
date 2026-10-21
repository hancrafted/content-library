import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { howToStartDoingSalesSection } from './sections/how-to-start-doing-sales';
import { startBeforeYouNeedTheMoneySection } from './sections/start-before-you-need-the-money';
import { whyBuildingAnEffectiveSalesPipelineTakesTimeSection } from './sections/why-building-an-effective-sales-pipeline-takes-time';
import { whySalesIsMoreThanJustSellingSection } from './sections/why-sales-is-more-than-just-selling';
import { whyWatchingCashflowIsMissionCriticalSection } from './sections/why-watching-cashflow-is-mission-critical';
import { hero } from './slides/hero/slide';

/*
 * "Why it's never too early to start with sales": revenue arrives months after the costs that create it, so start the
 * pipeline before you need the money. Built from the approved Spec of Run never-too-early-sales-run-3, whose Staging is in git at aab0030a; its Options are in design-archive/never-too-early-sales/.
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const neverTooEarlySales = episode({
  slug: 'never-too-early-sales',
  youtube: { en: 'lnr7T-IBHTw', de: 'lnr7T-IBHTw' },
  messages: { en, de },
  title: hero,
  sections: [
    whyWatchingCashflowIsMissionCriticalSection,
    whySalesIsMoreThanJustSellingSection,
    howToStartDoingSalesSection,
    whyBuildingAnEffectiveSalesPipelineTakesTimeSection,
    startBeforeYouNeedTheMoneySection,
  ],
});
