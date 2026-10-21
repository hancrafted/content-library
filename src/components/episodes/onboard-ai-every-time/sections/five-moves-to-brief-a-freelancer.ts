import type { Section } from '@/components/slide-master/slide';
import { briefTheVenue } from '../slides/brief-the-venue/slide';
import { fiveMovesToBriefAFreelancer } from '../slides/five-moves-to-brief-a-freelancer/slide';
import { manageThePrice } from '../slides/manage-the-price/slide';

/**
 * Placement marker of the Section "How do we work with this freelancer?": its section slide, the worked example, then
 * the five moves as the closing summary.
 */
export const fiveMovesToBriefAFreelancerSection: Section = [fiveMovesToBriefAFreelancer, briefTheVenue, manageThePrice];
