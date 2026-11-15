import type { CSSProperties } from 'react';

/*
 * The Slide's one emphasis motion, timed in one place (Spec Option 14a): the depth note travels from the card's slot
 * onto today's dive plan, then the "It depends…" line lights.
 */

/** How long the note takes to travel, in milliseconds. */
export const NOTE_MS = 1400;
/** How long after the Slide turns active the note sets off. */
export const NOTE_DELAY_MS = 400;
/** The verdict lights once the note has arrived. */
export const VERDICT_DELAY = { '--late-delay': `${NOTE_DELAY_MS + NOTE_MS}ms` } as CSSProperties;
