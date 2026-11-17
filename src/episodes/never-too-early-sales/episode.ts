import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { howToStartDoingSalesSection } from './sections/how-to-start-doing-sales';
import { startBeforeYouNeedTheMoneySection } from './sections/start-before-you-need-the-money';
import { whyBuildingAnEffectiveSalesPipelineTakesTimeSection } from './sections/why-building-an-effective-sales-pipeline-takes-time';
import { whySalesIsMoreThanJustSellingSection } from './sections/why-sales-is-more-than-just-selling';
import { whyWatchingCashflowIsMissionCriticalSection } from './sections/why-watching-cashflow-is-mission-critical';
import { hero } from './slides/hero/slide';

export const neverTooEarlySales = episode({
  slug: 'never-too-early-sales',
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
