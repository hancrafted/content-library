import type { Section } from '@/episodes/components/slide-master/slide';
import { everySkillIsALoan } from '../slides/every-skill-is-a-loan/slide';
import { keepingItAlive } from '../slides/keeping-it-alive/slide';
import { retireSkills } from '../slides/retire-skills/slide';
import { theModelChangesTheSkillDoesnT } from '../slides/the-model-changes-the-skill-doesn-t/slide';
import { theWholeIceberg } from '../slides/the-whole-iceberg/slide';

/** Placement marker of the Section "Keeping it alive": its Slides in Spec order, section slide first. */
export const keepingItAliveSection: Section = [
  keepingItAlive,
  everySkillIsALoan,
  theModelChangesTheSkillDoesnT,
  retireSkills,
  theWholeIceberg,
];
