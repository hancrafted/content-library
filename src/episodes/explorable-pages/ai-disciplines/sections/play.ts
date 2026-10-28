import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { play } from '../slides/play/slide';
import { timeline } from '../slides/timeline/slide';

/** The Section `play`: its section slide kept for the title but not shown, then the Explorable with every option on. */
export const playSection: Section = withoutSectionSlide([play, timeline]);
