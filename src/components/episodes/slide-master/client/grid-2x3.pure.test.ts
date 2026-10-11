import { describe, expect, it } from 'vitest';
import { GRID_2X3_CELLS, GRID_2X3_TONES, isRevealed, STAGGER_STEP_MS, staggerDelayMs } from './grid-2x3.pure';

describe('success cases', () => {
  it('starts each cell one step after the one before it, in reading order', () => {
    // ARRANGE
    const expected = GRID_2X3_CELLS.map((_, index) => index * STAGGER_STEP_MS);
    // ACT
    const delays = GRID_2X3_CELLS.map((_, index) => staggerDelayMs(index));
    // ASSERT
    expect(delays).toEqual(expected);
  });

  it('reveals the grid when the Slide becomes active', () => {
    // ARRANGE
    const wasRevealed = false;
    // ACT
    const revealed = isRevealed(wasRevealed, 'active');
    // ASSERT
    expect(revealed).toBe(true);
  });

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
  it('rejects a negative cell index', () => {
    // ARRANGE
    const stray = -1;
    // ACT
    const delay = () => staggerDelayMs(stray);
    // ASSERT
    expect(delay).toThrow(String(stray));
  });

  it('rejects a fractional cell index', () => {
    // ARRANGE
    const stray = 1.5;
    // ACT
    const delay = () => staggerDelayMs(stray);
    // ASSERT
    expect(delay).toThrow(String(stray));
  });
});

describe('edge cases', () => {
  it('keeps the grid revealed after the Slide leaves the active zone', () => {
    // ARRANGE
    const wasRevealed = true;
    // ACT
    const revealed = isRevealed(wasRevealed, 'near');
    // ASSERT
    expect(revealed).toBe(true);
  });

  it('keeps the grid hidden while the Slide is only near', () => {
    // ARRANGE
    const wasRevealed = false;
    // ACT
    const revealed = isRevealed(wasRevealed, 'near');
    // ASSERT
    expect(revealed).toBe(false);
  });

  it('starts the first cell at once', () => {
    // ARRANGE
    const first = 0;
    // ACT
    const delay = staggerDelayMs(first);
    // ASSERT
    expect(delay).toBe(first);
  });
});
