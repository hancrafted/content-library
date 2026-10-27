/** The six cells of the Grid 2 × 3 Slide, in reading order: row 1 left to right, then row 2. */
export const GRID_2X3_CELLS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;

export type Grid2x3Cell = (typeof GRID_2X3_CELLS)[number];

/** The decorative accent each cell is tinted with (primary or foreground, never a meaning colour); the tones alternate. */
export type Grid2x3Tone = 'primary' | 'foreground';

export const GRID_2X3_TONES: Record<Grid2x3Cell, Grid2x3Tone> = {
  c1: 'primary',
  c2: 'foreground',
  c3: 'primary',
  c4: 'foreground',
  c5: 'primary',
  c6: 'foreground',
};
