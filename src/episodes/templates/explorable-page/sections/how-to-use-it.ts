import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { everyOptionOn } from '../slides/every-option-on/slide';
import { howToUseIt } from '../slides/how-to-use-it/slide';

/** The Section "How to use it": its section slide is not shown, so the table of contents entry lands on the Explorable. */
export const howToUseItSection: Section = withoutSectionSlide([howToUseIt, everyOptionOn]);
