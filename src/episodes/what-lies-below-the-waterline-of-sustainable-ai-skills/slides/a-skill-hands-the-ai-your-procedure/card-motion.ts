import type { CSSProperties } from 'react';

/*
 * The Slide's one emphasis motion, timed in one place (Spec Option 2a): the card slides out of the manual, then the
 * skill's pill and leader appear last.
 */

/** How long the card takes to slide out, in milliseconds. */
export const CARD_MILLISECONDS = 1100;
/** How long after the Slide turns active the card starts. */
export const CARD_DELAY_MILLISECONDS = 300;
/** The skill's pill and leader wait for the card to arrive. */
export const LATE_DELAY = { '--late-delay': `${CARD_DELAY_MILLISECONDS + CARD_MILLISECONDS}ms` } as CSSProperties;
