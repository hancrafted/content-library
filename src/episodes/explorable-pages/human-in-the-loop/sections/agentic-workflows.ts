import type { Section } from '@/episodes/components/slide-master/slide';
import { agenticWorkflows } from '../slides/agentic-workflows/slide';
import { anotherUseCase } from '../slides/another-use-case/slide';
import { everyJob } from '../slides/every-job/slide';
import { humanInTheLoop } from '../slides/human-in-the-loop/slide';
import { inTheCommandLine } from '../slides/in-the-command-line/slide';

/** The Section "Agentic workflows": the section slide, then one Slide per way the Workflow is shown, each with its readme. */
export const agenticWorkflowsSection: Section = [
  agenticWorkflows,
  humanInTheLoop,
  everyJob,
  anotherUseCase,
  inTheCommandLine,
];
