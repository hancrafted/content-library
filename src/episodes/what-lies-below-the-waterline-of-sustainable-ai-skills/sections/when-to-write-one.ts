import type { Section } from '@/episodes/components/slide-master/slide';
import { notEveryRepeatDeservesASkill } from '../slides/not-every-repeat-deserves-a-skill/slide';
import { theThirdTimeIsTheSignal } from '../slides/the-third-time-is-the-signal/slide';
import { whenToWriteOne } from '../slides/when-to-write-one/slide';
import { writeItFromAGoodRun } from '../slides/write-it-from-a-good-run/slide';

export const whenToWriteOneSection: Section = [
  whenToWriteOne,
  theThirdTimeIsTheSignal,
  notEveryRepeatDeservesASkill,
  writeItFromAGoodRun,
];
