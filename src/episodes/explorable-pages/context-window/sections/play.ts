import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { everyPartAndControl } from '../slides/every-part-and-control/slide';
import { play } from '../slides/play/slide';

/** The Section `play`: its section slide kept for the title but not shown, then the Explorable with every option on. */
export const playSection: Section = withoutSectionSlide([play, everyPartAndControl]);
