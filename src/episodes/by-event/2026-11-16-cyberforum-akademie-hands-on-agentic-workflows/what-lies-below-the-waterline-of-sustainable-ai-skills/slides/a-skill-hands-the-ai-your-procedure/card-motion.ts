import type { CSSProperties } from 'react';

export const CARD_MILLISECONDS = 1100;
export const CARD_DELAY_MILLISECONDS = 300;
export const LATE_DELAY = { '--late-delay': `${CARD_DELAY_MILLISECONDS + CARD_MILLISECONDS}ms` } as CSSProperties;
