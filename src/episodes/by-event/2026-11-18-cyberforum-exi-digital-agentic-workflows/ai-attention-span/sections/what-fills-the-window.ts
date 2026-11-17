import type { Section } from '@/episodes/components/slide-master/slide';
import { oneInnocentQuestion } from '../slides/one-innocent-question/slide';
import { whatFillsTheWindow } from '../slides/what-fills-the-window/slide';
import { whatsReallyInTheWindow } from '../slides/whats-really-in-the-window/slide';
import { youCantWatchTheMeter } from '../slides/you-cant-watch-the-meter/slide';

/** Placement marker of the Section "What fills the window": its Slides in Spec order, section slide first. */
export const whatFillsTheWindowSection: Section = [
  whatFillsTheWindow,
  whatsReallyInTheWindow,
  oneInnocentQuestion,
  youCantWatchTheMeter,
];
