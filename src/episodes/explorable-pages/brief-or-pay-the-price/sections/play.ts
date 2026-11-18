import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { mirror } from '../slides/mirror/slide';
import { play } from '../slides/play/slide';

export const playSection: Section = withoutSectionSlide([play, mirror]);
