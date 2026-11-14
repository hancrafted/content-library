import type { CSSProperties } from 'react';

/*
 * The Slide's one emphasis motion, timed in one place (Spec Option 15b): both robots descend together, then the
 * "80 m short" bracket draws.
 */

/** How long the robots take to descend, in milliseconds; the robot's own `dive` settle plays as long. */
export const DESCENT_MS = 1400;
/** The bracket waits for the robots to stop. */
export const LATE_DELAY = { '--late-delay': `${DESCENT_MS}ms` } as CSSProperties;
