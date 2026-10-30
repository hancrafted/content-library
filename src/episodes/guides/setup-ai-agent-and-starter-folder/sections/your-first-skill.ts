import type { Section } from '@/episodes/components/slide-master/slide';
import { runYourFirstSkill } from '../slides/run-your-first-skill/slide';
import { yourFirstSkill } from '../slides/your-first-skill/slide';

/** Placement marker of the Section "Your first skill": its section slide, then its page Slides in Spec order. */
export const yourFirstSkillSection: Section = [yourFirstSkill, runYourFirstSkill];
