import type { Section } from '@/episodes/components/slide-master/slide';
import { close } from '../slides/close/slide';

/** Placement marker of the Section "Close": its Slide, which opens it; the Event's Playlist ends here. */
export const closeSection: Section = [close];
