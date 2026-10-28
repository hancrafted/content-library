import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { agenticWorkflows } from '../slides/agentic-workflows/slide';
import { anotherUseCase } from '../slides/another-use-case/slide';
import { everyJob } from '../slides/every-job/slide';
import { humanInTheLoop } from '../slides/human-in-the-loop/slide';
import { inTheCommandLine } from '../slides/in-the-command-line/slide';

/** The Section "Agentic workflows": its section slide kept for the title but not shown, then one Slide per way the Workflow is shown, each with its readme. */
export const agenticWorkflowsSection: Section = withoutSectionSlide([
  agenticWorkflows,
  humanInTheLoop,
  everyJob,
  anotherUseCase,
  inTheCommandLine,
]);
