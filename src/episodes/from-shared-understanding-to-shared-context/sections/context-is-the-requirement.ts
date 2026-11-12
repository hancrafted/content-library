import type { Section } from '@/episodes/components/slide-master/slide';
import { contextEngineeringIsRequirementsEngineeringForAgents } from '../slides/context-engineering-is-requirements-engineering-for-agents/slide';
import { contextIsTheRequirement } from '../slides/context-is-the-requirement/slide';
import { contextRot } from '../slides/context-rot/slide';
import { keepingTheBenchClean } from '../slides/keeping-the-bench-clean/slide';
import { staticAndDynamicContext } from '../slides/static-and-dynamic-context/slide';
import { whatTheAiActuallySees } from '../slides/what-the-ai-actually-sees/slide';
import { youRunTheBench } from '../slides/you-run-the-bench/slide';

/** Placement marker of the Section "Context is the requirement": its Slides in Spec order, section slide first. */
export const contextIsTheRequirementSection: Section = [
  contextIsTheRequirement,
  whatTheAiActuallySees,
  contextEngineeringIsRequirementsEngineeringForAgents,
  staticAndDynamicContext,
  youRunTheBench,
  contextRot,
  keepingTheBenchClean,
];
