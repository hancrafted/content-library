import type { Section } from '@/episodes/components/slide-master/slide';
import { contextWindow } from '../slides/context-window/slide';
import { everyPartAndControl } from '../slides/every-part-and-control/slide';

/** The Section "Context window": the section slide, then each way the context window cornerstone is shown. */
export const contextWindowSection: Section = [contextWindow, everyPartAndControl];
