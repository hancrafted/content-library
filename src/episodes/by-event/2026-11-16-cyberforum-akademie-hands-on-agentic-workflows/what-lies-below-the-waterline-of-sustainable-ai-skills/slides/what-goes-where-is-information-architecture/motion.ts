import type { CSSProperties } from 'react';

/** How long the note takes to travel, in milliseconds. */
export const NOTE_MILLISECONDS = 1400;
/** How long after the Slide turns active the note sets off. */
export const NOTE_DELAY_MILLISECONDS = 400;
export const VERDICT_DELAY = { '--late-delay': `${NOTE_DELAY_MILLISECONDS + NOTE_MILLISECONDS}ms` } as CSSProperties;
