import type { CSSProperties } from 'react';

/** How long the card takes to slide out, in milliseconds. */
export const CARD_MILLISECONDS = 1100;
/** How long after the Slide turns active the card starts. */
export const CARD_DELAY_MILLISECONDS = 300;
export const LATE_DELAY = { '--late-delay': `${CARD_DELAY_MILLISECONDS + CARD_MILLISECONDS}ms` } as CSSProperties;
