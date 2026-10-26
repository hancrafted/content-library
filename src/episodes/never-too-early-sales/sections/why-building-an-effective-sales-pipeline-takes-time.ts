import type { Section } from '@/episodes/components/slide-master/slide';
import { pipelineByTheNumbers } from '../slides/pipeline-by-the-numbers/slide';
import { whatIsASalesPipeline } from '../slides/what-is-a-sales-pipeline/slide';
import { whyBuildingAnEffectiveSalesPipelineTakesTime } from '../slides/why-building-an-effective-sales-pipeline-takes-time/slide';
import { whyItTakesTimeToRampUp } from '../slides/why-it-takes-time-to-ramp-up/slide';

/** Placement marker of the Section "Why building an effective sales pipeline takes time": its Slides in Spec order, section slide first. Its Section job adds the page Slides here. */
export const whyBuildingAnEffectiveSalesPipelineTakesTimeSection: Section = [
  whyBuildingAnEffectiveSalesPipelineTakesTime,
  whatIsASalesPipeline,
  pipelineByTheNumbers,
  whyItTakesTimeToRampUp,
];
