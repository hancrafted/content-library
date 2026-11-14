import type { Section } from '@/episodes/components/slide-master/slide';
import { aThoughtExperiment } from '../slides/a-thought-experiment/slide';
import { nowWithAgents } from '../slides/now-with-agents/slide';
import { theThoughtExperiment } from '../slides/the-thought-experiment/slide';

/** Placement marker of the Section "A thought experiment": its Slides in Spec order, section slide first. */
export const aThoughtExperimentSection: Section = [aThoughtExperiment, theThoughtExperiment, nowWithAgents];
