import type { Section } from '@/episodes/components/slide-master/slide';
import { aiForgetsTheMiddleToo } from '../slides/ai-forgets-the-middle-too/slide';
import { theLongPhoneCallStory } from '../slides/the-long-phone-call-story/slide';
import { thoughtExperiment } from '../slides/thought-experiment/slide';

/** Placement marker of the Section "Thought experiment": its Slides in Spec order, section slide first. */
export const thoughtExperimentSection: Section = [thoughtExperiment, theLongPhoneCallStory, aiForgetsTheMiddleToo];
