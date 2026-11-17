import type { Section } from '@/episodes/components/slide-master/slide';
import { everySkillIsALoan } from '../slides/every-skill-is-a-loan/slide';
import { keepingItAlive } from '../slides/keeping-it-alive/slide';
import { retireSkills } from '../slides/retire-skills/slide';
import { theModelChangesTheSkillDoesnT } from '../slides/the-model-changes-the-skill-doesn-t/slide';
import { theWholeIceberg } from '../slides/the-whole-iceberg/slide';

export const keepingItAliveSection: Section = [
  keepingItAlive,
  everySkillIsALoan,
  theModelChangesTheSkillDoesnT,
  retireSkills,
  theWholeIceberg,
];
