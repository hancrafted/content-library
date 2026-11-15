import type { Section } from '@/episodes/components/slide-master/slide';
import { whatAnAgentIs } from '../slides/what-an-agent-is/slide';
import { whatAnAgenticWorkflowIsSlide } from '../slides/what-an-agentic-workflow-is-slide/slide';
import { whatAnAgenticWorkflowIs } from '../slides/what-an-agentic-workflow-is/slide';

/** Placement marker of the Section "What an agentic workflow is": its Slides in Spec order, section slide first. */
export const whatAnAgenticWorkflowIsSection: Section = [
  whatAnAgenticWorkflowIs,
  whatAnAgentIs,
  whatAnAgenticWorkflowIsSlide,
];
