import type { Section } from '@/episodes/components/slide-master/slide';
import { oneInnocentQuestion } from '@/episodes/slide-pool/one-innocent-question/slide';
import { whatsReallyInTheWindow } from '@/episodes/slide-pool/whats-really-in-the-window/slide';
import { youCantWatchTheMeter } from '@/episodes/slide-pool/you-cant-watch-the-meter/slide';
import { whatFillsTheWindow } from '../slides/what-fills-the-window/slide';

export const whatFillsTheWindowSection: Section = [
  whatFillsTheWindow,
  whatsReallyInTheWindow,
  oneInnocentQuestion,
  youCantWatchTheMeter,
];
