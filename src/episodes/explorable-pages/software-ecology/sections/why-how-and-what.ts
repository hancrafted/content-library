import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { about } from '../slides/about/slide';
import { whyHowWhat } from '../slides/why-how-what/slide';

export const aboutSection: Section = withoutSectionSlide([about, whyHowWhat]);
