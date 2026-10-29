import type { Section } from '@/episodes/components/slide-master/slide';
import { openYourTerminal } from '../slides/open-your-terminal/slide';
import { overview } from '../slides/overview/slide';
import { yourTerminal } from '../slides/your-terminal/slide';

/** Placement marker of the Section "Your terminal": its section slide, then its page Slides in Spec order. */
export const yourTerminalSection: Section = [yourTerminal, overview, openYourTerminal];
