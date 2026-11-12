import type { Section } from '@/episodes/components/slide-master/slide';
import { aboutMe } from '../slides/about-me/slide';

/** Placement marker of the Section "About me": its Slide, which opens it, so its anchor is `about-me`. */
export const aboutMeSection: Section = [aboutMe];
