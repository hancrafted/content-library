import type { SlideZone } from '@/lib/slide-zone.pure';

/** The six cells of the Grid 2 × 3 Slide, in reading order: row 1 left to right, then row 2. */
export const GRID_2X3_CELLS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;

export type Grid2x3Cell = (typeof GRID_2X3_CELLS)[number];

/** The accent each cell is tinted with; the rows rotate so no column repeats a tone. */
export type Grid2x3Tone = 'machine' | 'human' | 'ai';

export const GRID_2X3_TONES: Record<Grid2x3Cell, Grid2x3Tone> = {
  c1: 'machine',
  c2: 'human',
  c3: 'ai',
  c4: 'ai',
  c5: 'machine',
  c6: 'human',
};

/** Milliseconds between one cell starting to fade in and the next. */
export const STAGGER_STEP_MS = 80;

/** How long after the grid is revealed the cell at `index` (0-based, reading order) starts to fade in. */
export function staggerDelayMs(index: number, stepMs: number = STAGGER_STEP_MS): number {
  if (!Number.isInteger(index) || index < 0) throw new Error(`"${index}" is not a cell index.`);
  return index * stepMs;
}

/** One-shot latch: once the Slide has been `active`, the grid stays revealed whatever the zone does next. */
export function isRevealed(wasRevealed: boolean, zone: SlideZone): boolean {
  return wasRevealed || zone === 'active';
}
