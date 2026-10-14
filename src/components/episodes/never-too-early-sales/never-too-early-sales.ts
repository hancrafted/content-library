import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { watchYourCashflow } from './slides/watch-your-cashflow/slide';
import { whyCashflowMatters } from './slides/why-cashflow-matters/slide';

/*
 * "Why it's never too early to start with sales", an Upcoming Episode. English
 * is its approved Dossier's text; every German file holds the same English
 * strings as a provisional fallback until the German translation after
 * Promotion. One import and one list entry per Slide, in Dossier order.
 */
export const neverTooEarlySales = episode({
  slug: 'never-too-early-sales',
  messages: { en, de },
  sections: [[whyCashflowMatters, watchYourCashflow]],
});
