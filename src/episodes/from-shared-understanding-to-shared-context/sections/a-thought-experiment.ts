import type { Section } from '@/episodes/components/slide-master/slide';
import { aThoughtExperiment } from '../slides/a-thought-experiment/slide';
import { speedTheWholeLineCanCarry } from '../slides/speed-the-whole-line-can-carry/slide';
import { whatHappensWithAi } from '../slides/what-happens-with-ai/slide';
import { whatTheCustomerReallyWanted } from '../slides/what-the-customer-really-wanted/slide';

/** Placement marker of the Section "A thought experiment": its Slides in Spec order, section slide first. */
export const aThoughtExperimentSection: Section = [
  aThoughtExperiment,
  whatTheCustomerReallyWanted,
  whatHappensWithAi,
  speedTheWholeLineCanCarry,
];
