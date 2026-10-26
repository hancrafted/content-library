import type { Section } from '@/episodes/components/slide-master/slide';
import { watchYourCashflow } from '../slides/watch-your-cashflow/slide';
import { whyWatchingCashflowIsMissionCritical } from '../slides/why-watching-cashflow-is-mission-critical/slide';

/** Placement marker of the Section "Why watching cashflow is mission critical": its Slides in Spec order, section slide first. Its Section job adds the page Slides here. */
export const whyWatchingCashflowIsMissionCriticalSection: Section = [
  whyWatchingCashflowIsMissionCritical,
  watchYourCashflow,
];
