import type { Section } from '@/episodes/components/slide-master/slide';
import { notEveryRepeatDeservesASkill } from '../slides/not-every-repeat-deserves-a-skill/slide';
import { theThirdTimeIsTheSignal } from '../slides/the-third-time-is-the-signal/slide';
import { whenToWriteOne } from '../slides/when-to-write-one/slide';
import { writeItFromAGoodRun } from '../slides/write-it-from-a-good-run/slide';

/** Placement marker of the Section "When to write one": its Slides in Spec order, section slide first. */
export const whenToWriteOneSection: Section = [
  whenToWriteOne,
  theThirdTimeIsTheSignal,
  notEveryRepeatDeservesASkill,
  writeItFromAGoodRun,
];
