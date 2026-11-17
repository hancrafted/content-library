import type { CSSProperties } from 'react';

/** How long the robots take to descend, in milliseconds; the robot's own `dive` settle plays as long. */
export const DESCENT_MILLISECONDS = 1400;
export const LATE_DELAY = { '--late-delay': `${DESCENT_MILLISECONDS}ms` } as CSSProperties;
