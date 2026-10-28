import type { Section } from '@/episodes/components/slide-master/slide';
import { aboutMe } from '@/episodes/slide-pool/about-me/slide';
import { poll } from '../slides/poll/slide';

/**
 * Placement marker of the Section "Poll": the poll opens it, About me follows as a pool Slide. About me cannot open a
 * Section of its own: a marker is named after its section slide, and a Section never imports the pool Slide of its name.
 */
export const pollSection: Section = [poll, aboutMe];
