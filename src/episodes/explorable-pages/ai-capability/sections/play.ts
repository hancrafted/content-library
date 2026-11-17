import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { play } from '../slides/play/slide';
import { timeline } from '../slides/timeline/slide';

export const playSection: Section = withoutSectionSlide([play, timeline]);
