import type { Section } from '@/episodes/components/slide-master/slide';
import { contractsAtTheSeams } from '../slides/contracts-at-the-seams/slide';
import { planBackFromTheGoal } from '../slides/plan-back-from-the-goal/slide';
import { reviewingTheResult } from '../slides/reviewing-the-result/slide';
import { whatItRequiresOfEachPerson } from '../slides/what-it-requires-of-each-person/slide';

export const whatItRequiresOfEachPersonSection: Section = [
  whatItRequiresOfEachPerson,
  planBackFromTheGoal,
  contractsAtTheSeams,
  reviewingTheResult,
];
