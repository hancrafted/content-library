import type { Section } from '@/episodes/components/slide-master/slide';
import { firstHumanInTheLoopAgenticWorkflow } from '@/episodes/slide-pool/first-human-in-the-loop-agentic-workflow/slide';
import { manageThePrice } from '@/episodes/slide-pool/manage-the-price/slide';
import { fiveMovesToBriefAFreelancer } from '../slides/five-moves-to-brief-a-freelancer/slide';

/**
 * Placement marker of the Section "How do we work with this freelancer?": its section slide, the five moves against
 * the five traits, then the first human-in-the-loop agentic Workflow that walks the summer party through them.
 */
export const fiveMovesToBriefAFreelancerSection: Section = [
  fiveMovesToBriefAFreelancer,
  manageThePrice,
  firstHumanInTheLoopAgenticWorkflow,
];
