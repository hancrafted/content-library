import type { Section } from '@/episodes/components/slide-master/slide';
import { everyRevolutionOneCard } from '@/episodes/slide-pool/every-revolution-one-card/slide';
import { practiseItTodayAtWork } from '@/episodes/slide-pool/practise-it-today-at-work/slide';
import { youWerePromoted } from '@/episodes/slide-pool/you-were-promoted/slide';
import { fromExecutionToManagement } from '../slides/from-execution-to-management/slide';

export const fromExecutionToManagementSection: Section = [
  fromExecutionToManagement,
  everyRevolutionOneCard,
  youWerePromoted,
  practiseItTodayAtWork,
];
