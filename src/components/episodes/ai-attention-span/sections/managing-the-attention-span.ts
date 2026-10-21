import type { Section } from '@/components/slide-master/slide';
import { everydayHabits } from '../slides/everyday-habits/slide';
import { managingTheAttentionSpan } from '../slides/managing-the-attention-span/slide';
import { nowYouKnowHowItFeels } from '../slides/now-you-know-how-it-feels/slide';
import { theWorkflowForBiggerProjects } from '../slides/the-workflow-for-bigger-projects/slide';

/** Placement marker of the Section "Managing the attention span": its Slides in Spec order, section slide first. */
export const managingTheAttentionSpanSection: Section = [
  managingTheAttentionSpan,
  everydayHabits,
  theWorkflowForBiggerProjects,
  nowYouKnowHowItFeels,
];
