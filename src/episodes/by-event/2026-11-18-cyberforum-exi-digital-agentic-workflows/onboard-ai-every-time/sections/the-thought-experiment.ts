import type { Section } from '@/episodes/components/slide-master/slide';
import { onePrompt } from '@/episodes/slide-pool/one-prompt/slide';
import { youAreTheNewHire } from '@/episodes/slide-pool/you-are-the-new-hire/slide';
import { payThePrice } from '../slides/pay-the-price/slide';
import { theThoughtExperiment } from '../slides/the-thought-experiment/slide';

export const theThoughtExperimentSection: Section = [theThoughtExperiment, youAreTheNewHire, payThePrice, onePrompt];
