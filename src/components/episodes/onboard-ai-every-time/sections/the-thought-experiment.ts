import type { Section } from '@/components/slide-master/slide';
import { payThePrice } from '../slides/pay-the-price/slide';
import { theThoughtExperiment } from '../slides/the-thought-experiment/slide';
import { youAreTheNewHire } from '../slides/you-are-the-new-hire/slide';

/** Placement marker of the Section "The thought experiment": its Slides in Spec order, section slide first. */
export const theThoughtExperimentSection: Section = [theThoughtExperiment, youAreTheNewHire, payThePrice];
