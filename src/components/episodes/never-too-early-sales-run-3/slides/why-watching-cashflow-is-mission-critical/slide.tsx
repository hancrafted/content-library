import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why watching cashflow is mission critical": the Slide header names the Section; the Scene stays
// empty.
export const whyWatchingCashflowIsMissionCritical = slide({
  slug: 'why-watching-cashflow-is-mission-critical',
  messages: { en, de },
  segments: [{ slug: 'imagine-the-wall' }, { slug: 'cash-decides-how-long-you-have' }, { slug: 'the-route' }],
  content: () => null,
});
