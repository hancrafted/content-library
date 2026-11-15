import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { checkIn1 } from '../slides/check-in-1/slide';
import { checkIn2 } from '../slides/check-in-2/slide';
import { checkIn3 } from '../slides/check-in-3/slide';
import { openingPoll } from '../slides/opening-poll/slide';
import { poll } from '../slides/poll/slide';

/**
 * The Section `poll`: every poll of the day in one place, its section slide kept for the title but not shown. The
 * opening poll takes the anchor `poll`; each check-in its own (`poll--check-in-1`), which the Event's Playlist opens
 * after its theory Episode.
 */
export const pollSection: Section = withoutSectionSlide([poll, openingPoll, checkIn1, checkIn2, checkIn3]);
