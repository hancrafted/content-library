import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { hook } from '../slides/hook/slide';
import { thePayoff } from '../slides/the-payoff/slide';
import { theProof } from '../slides/the-proof/slide';

/** The Section "Hook": lands the value in its first Slides, the Short's framing. Its section slide is not shown: it would repeat the title. */
export const hookSection: Section = withoutSectionSlide([hook, thePayoff, theProof]);
