import type { Section } from '@/components/slide-master/slide';
import { howMarketingFeedsThePipeline } from '../slides/how-marketing-feeds-the-pipeline/slide';
import { howToStartDoingSales } from '../slides/how-to-start-doing-sales/slide';
import { pipelineToolsInPractice } from '../slides/pipeline-tools-in-practice/slide';
import { stagesOfSale } from '../slides/stages-of-sale/slide';
import { watchYourCashflowRevenuePulledIn } from '../slides/watch-your-cashflow-revenue-pulled-in/slide';

/** Placement marker of the Section "How to start doing sales": its Slides in Spec order, section slide first. */
export const howToStartDoingSalesSection: Section = [
  howToStartDoingSales,
  stagesOfSale,
  pipelineToolsInPractice,
  howMarketingFeedsThePipeline,
  watchYourCashflowRevenuePulledIn,
];
