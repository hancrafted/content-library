import type { Section } from '@/episodes/components/slide-master/slide';
import { firstHumanInTheLoopAgenticWorkflow } from '@/episodes/slide-pool/first-human-in-the-loop-agentic-workflow/slide';
import { manageThePrice } from '@/episodes/slide-pool/manage-the-price/slide';
import { fiveMovesToBriefAFreelancer } from '../slides/five-moves-to-brief-a-freelancer/slide';

/**
 * Placement marker of the Section "How do we work with this freelancer?": its section slide, the worked example, then
 * the five moves as the closing summary.
 */
export const fiveMovesToBriefAFreelancerSection: Section = [
  fiveMovesToBriefAFreelancer,
  firstHumanInTheLoopAgenticWorkflow,
  manageThePrice,
];
