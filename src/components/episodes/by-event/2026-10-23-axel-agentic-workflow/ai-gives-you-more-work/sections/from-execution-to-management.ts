import type { Section } from '@/components/slide-master/slide';
import { everyRevolutionOneCard } from '../slides/every-revolution-one-card/slide';
import { fromExecutionToManagement } from '../slides/from-execution-to-management/slide';
import { practiseItTodayAtWork } from '../slides/practise-it-today-at-work/slide';
import { youWerePromoted } from '../slides/you-were-promoted/slide';

/** Placement marker of the Section "From execution to management": its Slides in Spec order, section slide first. */
export const fromExecutionToManagementSection: Section = [
  fromExecutionToManagement,
  everyRevolutionOneCard,
  youWerePromoted,
  practiseItTodayAtWork,
];
