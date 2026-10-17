import { describe, expect, it } from 'vitest';
import { GRID_2X3_CELLS, GRID_2X3_TONES } from './grid-2x3.pure';

describe('success cases', () => {
  it('never gives two cells in the same column the same tone', () => {
    // ARRANGE
    const columns = 3;
    const tones = GRID_2X3_CELLS.map((cell) => GRID_2X3_TONES[cell]);
    // ACT
    const repeats = tones.slice(columns).filter((tone, index) => tone === tones[index]);
    // ASSERT
    expect(repeats).toEqual([]);
  });
});

describe('failure cases', () => {
  it('tints no cell with anything but a decorative accent', () => {
    // ARRANGE
    const accents = ['primary', 'foreground'];
    // ACT
    const strays = GRID_2X3_CELLS.filter((cell) => !accents.includes(GRID_2X3_TONES[cell]));
    // ASSERT
    expect(strays).toEqual([]);
  });
});

describe('edge cases', () => {
  it('alternates the tone across the row break, from the last cell of row 1 to the first of row 2', () => {
    // ARRANGE
    const lastOfRowOne = GRID_2X3_TONES.c3;
    // ACT
    const firstOfRowTwo = GRID_2X3_TONES.c4;
    // ASSERT
    expect(firstOfRowTwo).not.toBe(lastOfRowOne);
  });
});
