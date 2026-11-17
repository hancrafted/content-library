import type { CSSProperties } from 'react';

export const NOTE_MILLISECONDS = 1400;
export const NOTE_DELAY_MILLISECONDS = 400;
export const VERDICT_DELAY = { '--late-delay': `${NOTE_DELAY_MILLISECONDS + NOTE_MILLISECONDS}ms` } as CSSProperties;
