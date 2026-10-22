import type { Section } from '@/components/slide-master/slide';
import { agenticWorkflows } from '../slides/agentic-workflows/slide';
import { humanInTheLoop } from '../slides/human-in-the-loop/slide';

/** The Section "Agentic workflows": the section slide, then each way a Workflow cornerstone is shown. */
export const agenticWorkflowsSection: Section = [agenticWorkflows, humanInTheLoop];
