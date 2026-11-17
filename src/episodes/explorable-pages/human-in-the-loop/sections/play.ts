import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { humanInTheLoop } from '../slides/human-in-the-loop/slide';
import { play } from '../slides/play/slide';

export const playSection: Section = withoutSectionSlide([play, humanInTheLoop]);
