import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { everyOptionOn } from '../slides/every-option-on/slide';
import { play } from '../slides/play/slide';

export const playSection: Section = withoutSectionSlide([play, everyOptionOn]);
