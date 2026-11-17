import type { Section } from '@/episodes/components/slide-master/slide';
import { attentionIsABudget } from '../slides/attention-is-a-budget/slide';
import { theAisAttentionSpan } from '../slides/the-ais-attention-span/slide';
import { theContextWindow } from '../slides/the-context-window/slide';
import { whatHappensWhenTheBarFillsUp } from '../slides/what-happens-when-the-bar-fills-up/slide';
import { whatWeLearnedSoFar } from '../slides/what-we-learned-so-far/slide';

export const theAisAttentionSpanSection: Section = [
  theAisAttentionSpan,
  theContextWindow,
  whatHappensWhenTheBarFillsUp,
  attentionIsABudget,
  whatWeLearnedSoFar,
];
