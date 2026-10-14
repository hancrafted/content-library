import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { salesIsMoreThanSelling } from './slides/sales-is-more-than-selling/slide';
import { watchYourCashflow } from './slides/watch-your-cashflow/slide';
import { whySalesIsMoreThanJustSelling } from './slides/why-sales-is-more-than-just-selling/slide';
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
    [whySalesIsMoreThanJustSelling, salesIsMoreThanSelling],
  ],
});
