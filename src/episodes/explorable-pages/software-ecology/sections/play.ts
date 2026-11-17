import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { factory } from '../slides/factory/slide';
import { play } from '../slides/play/slide';

export const playSection: Section = withoutSectionSlide([play, factory]);
