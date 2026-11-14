import type { Section } from '@/episodes/components/slide-master/slide';
import { aSkillHandsTheAiYourProcedure } from '../slides/a-skill-hands-the-ai-your-procedure/slide';
import { aThoughtExperiment } from '../slides/a-thought-experiment/slide';
import { anAiModelThatForgetsEveryMorning } from '../slides/an-ai-model-that-forgets-every-morning/slide';

/** Placement marker of the Section "A thought experiment": its Slides in Spec order, section slide first. */
export const aThoughtExperimentSection: Section = [
  aThoughtExperiment,
  anAiModelThatForgetsEveryMorning,
  aSkillHandsTheAiYourProcedure,
];
