import type { Section } from '@/episodes/components/slide-master/slide';
import { attentionIsABudget } from '@/episodes/slide-pool/attention-is-a-budget/slide';
import { theContextWindow } from '@/episodes/slide-pool/the-context-window/slide';
import { whatHappensWhenTheBarFillsUp } from '@/episodes/slide-pool/what-happens-when-the-bar-fills-up/slide';
import { whatWeLearnedSoFar } from '@/episodes/slide-pool/what-we-learned-so-far/slide';
import { theAisAttentionSpan } from '../slides/the-ais-attention-span/slide';

export const theAisAttentionSpanSection: Section = [
  theAisAttentionSpan,
  theContextWindow,
  whatHappensWhenTheBarFillsUp,
  attentionIsABudget,
  whatWeLearnedSoFar,
];
