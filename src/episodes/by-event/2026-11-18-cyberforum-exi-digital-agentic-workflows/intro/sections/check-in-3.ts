import type { Section } from '@/episodes/components/slide-master/slide';
import { checkIn3 } from '../slides/check-in-3/slide';
import { disciplinesRecap } from '../slides/disciplines-recap/slide';

/**
 * Placement marker of the Section "Check-in: from doing to managing": its Slide opens it, the disciplines recap follows;
 * the Event's Playlist links here by anchor.
 */
export const checkIn3Section: Section = [checkIn3, disciplinesRecap];
