import type { Section } from '@/episodes/components/slide-master/slide';
import { moreSkillsHarderChoice } from '../slides/more-skills-harder-choice/slide';
import { nameTheMomentNotTheContent } from '../slides/name-the-moment-not-the-content/slide';
import { theDescriptionIsAllTheAiSees } from '../slides/the-description-is-all-the-ai-sees/slide';
import { theLabel } from '../slides/the-label/slide';

/** Placement marker of the Section "The label": its Slides in Spec order, section slide first. */
export const theLabelSection: Section = [
  theLabel,
  theDescriptionIsAllTheAiSees,
  nameTheMomentNotTheContent,
  moreSkillsHarderChoice,
];
