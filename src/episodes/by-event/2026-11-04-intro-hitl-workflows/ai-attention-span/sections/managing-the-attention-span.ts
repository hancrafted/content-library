import type { Section } from '@/episodes/components/slide-master/slide';
import { everydayHabits } from '@/episodes/slide-pool/everyday-habits/slide';
import { humanInTheLoopWorkflow } from '@/episodes/slide-pool/human-in-the-loop-workflow/slide';
import { nowYouKnowHowItFeels } from '@/episodes/slide-pool/now-you-know-how-it-feels/slide';
import { theWorkflowForBiggerProjects } from '@/episodes/slide-pool/the-workflow-for-bigger-projects/slide';
import { managingTheAttentionSpan } from '../slides/managing-the-attention-span/slide';

export const managingTheAttentionSpanSection: Section = [
  managingTheAttentionSpan,
  everydayHabits,
  theWorkflowForBiggerProjects,
  humanInTheLoopWorkflow,
  nowYouKnowHowItFeels,
];
