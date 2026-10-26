import { onePrompt } from '@/components/episodes/slide-pool/one-prompt/slide';
import { payThePrice } from '@/components/episodes/slide-pool/pay-the-price/slide';
import { youAreTheNewHire } from '@/components/episodes/slide-pool/you-are-the-new-hire/slide';
import type { Section } from '@/components/slide-master/slide';
import { theThoughtExperiment } from '../slides/the-thought-experiment/slide';

/** Placement marker of the Section "The thought experiment": its Slides in Spec order, section slide first. */
export const theThoughtExperimentSection: Section = [theThoughtExperiment, youAreTheNewHire, payThePrice, onePrompt];
