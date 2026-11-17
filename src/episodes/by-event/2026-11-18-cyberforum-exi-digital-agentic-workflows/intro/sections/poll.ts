import type { Section } from '@/episodes/components/slide-master/slide';
import { poll } from '../slides/poll/slide';

/** Placement marker of the Section "Poll": its Slide, which opens it. About me follows as a Section of its own. */
export const pollSection: Section = [poll];
