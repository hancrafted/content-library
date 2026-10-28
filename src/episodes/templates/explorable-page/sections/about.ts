import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { about } from '../slides/about/slide';
import { whyHowWhat } from '../slides/why-how-what/slide';

/** The Section `about`: its section slide kept for the title but not shown, then Why, How and What on one Slide. */
export const aboutSection: Section = withoutSectionSlide([about, whyHowWhat]);
