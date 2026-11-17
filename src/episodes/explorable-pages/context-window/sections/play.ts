import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { everyPartAndControl } from '../slides/every-part-and-control/slide';
import { play } from '../slides/play/slide';

export const playSection: Section = withoutSectionSlide([play, everyPartAndControl]);
