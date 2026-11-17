import type { Section } from '@/episodes/components/slide-master/slide';
import { pipelineByTheNumbers } from '../slides/pipeline-by-the-numbers/slide';
import { whatIsASalesPipeline } from '../slides/what-is-a-sales-pipeline/slide';
import { whyBuildingAnEffectiveSalesPipelineTakesTime } from '../slides/why-building-an-effective-sales-pipeline-takes-time/slide';
import { whyItTakesTimeToRampUp } from '../slides/why-it-takes-time-to-ramp-up/slide';

export const whyBuildingAnEffectiveSalesPipelineTakesTimeSection: Section = [
  whyBuildingAnEffectiveSalesPipelineTakesTime,
  whatIsASalesPipeline,
  pipelineByTheNumbers,
  whyItTakesTimeToRampUp,
];
