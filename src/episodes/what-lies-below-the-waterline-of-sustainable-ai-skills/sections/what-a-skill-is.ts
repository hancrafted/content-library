import type { Section } from '@/episodes/components/slide-master/slide';
import { aSkillIsAWrittenProcedure } from '../slides/a-skill-is-a-written-procedure/slide';
import { instructionsSkillsAndConnectors } from '../slides/instructions-skills-and-connectors/slide';
import { skillsAreDynamicContext } from '../slides/skills-are-dynamic-context/slide';
import { threeLevelsOfLoading } from '../slides/three-levels-of-loading/slide';
import { twoWaysToCallASkill } from '../slides/two-ways-to-call-a-skill/slide';
import { whatASkillIs } from '../slides/what-a-skill-is/slide';

/** Placement marker of the Section "What a skill is": its Slides in Spec order, section slide first. */
export const whatASkillIsSection: Section = [
  whatASkillIs,
  aSkillIsAWrittenProcedure,
  threeLevelsOfLoading,
  skillsAreDynamicContext,
  instructionsSkillsAndConnectors,
  twoWaysToCallASkill,
];
