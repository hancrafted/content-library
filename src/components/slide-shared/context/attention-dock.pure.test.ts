import { describe, expect, it } from 'vitest';
import { anchorIndex, dockHeights, falloff, MIN_ROW, pointerIndex, REACH, restHeights } from './attention-dock.pure';

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const UNITS = [15, 4, 1, 2, 10, 3, 2, 4, 2, 2, 6, 4, 2, 4, 2, 1, 3, 3, 6, 9, 15];
const TOTAL = 360;
const FULL = 24;
const EPS = 1e-6;
const TOLERANCE = 0.05;
const near = (actual: number, expected: number) => Math.abs(actual - expected) < EPS;

describe('success cases', () => {
  it('sizes each row by its share of the attention, and fills the total', () => {
    // ARRANGE
    const total = 400;
    const expected = [200, 120, 80];
    // ACT
    const rest = restHeights([50, 30, 20], total, 1000);
    // ASSERT
    expect(rest.map((h, i) => near(h, expected[i] ?? NaN))).toEqual([true, true, true]);
  });

  it('gives every row its natural height while they all fit, so rows simply add as the timeline advances', () => {
    // ARRANGE
    const fits = UNITS.slice(0, 5);
    const expected = fits.map(() => FULL);
    // ACT
    const rest = restHeights(fits, TOTAL, FULL);
    // ASSERT
    expect(rest).toEqual(expected);
  });

  it('compresses the middle rows first once the list is full, and keeps the start and the newest natural', () => {
    // ARRANGE
    const units = [15, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 40];
    const total = 12 * FULL;
    // ACT
    const rest = restHeights(units, total, FULL);
    // ASSERT
    expect([rest[0], rest.at(-1)]).toEqual([FULL, FULL]);
    expect(Math.max(...rest.slice(1, -1))).toBeLessThan(FULL);
    expect(near(sum(rest), total)).toBe(true);
  });

  it('keeps the total height constant while the pointer moves over any row', () => {
    // ARRANGE
    const rest = restHeights(UNITS, TOTAL, FULL);
    // ACT
    const totals = rest.map((_, i) => sum(dockHeights(rest, i, FULL)));
    // ASSERT
    expect(totals.every((total) => near(total, TOTAL))).toBe(true);
  });

  it('grows the row under the pointer towards the full row height', () => {
    // ARRANGE
    const rest = restHeights(UNITS, TOTAL, FULL);
    const under = 2;
    // ACT
    const docked = dockHeights(rest, under, FULL);
    // ASSERT
    expect(near(docked[under] ?? 0, FULL)).toBe(true);
    expect(docked[under]).toBeGreaterThan(rest[under] ?? 0);
  });

  it('falls off over three rows either side and not beyond', () => {
    // ARRANGE
    const beyond = [REACH, REACH + 1];
    // ACT
    const [under, near1, near2] = [0, 1, 2].map(falloff);
    const outside = beyond.map(falloff);
    // ASSERT
    expect(under).toBe(1);
    expect(near1).toBeGreaterThan(near2 ?? 0);
    expect(near2).toBeGreaterThan(0);
    expect(outside).toEqual([0, 0]);
  });

  it('maps a pointer position to a continuous row index on the resting layout', () => {
    // ARRANGE
    const rest = [100, 100, 200];
    const expected = [0, 1.5, 2.5, 2];
    // ACT
    const indexes = [0, 150, 300, 999].map((y) => pointerIndex(rest, y));
    // ASSERT
    expect(indexes.map((index, i) => near(index, expected[i] ?? NaN))).toEqual([true, true, true, true]);
  });

  it('puts the magnified row under the pointer, so the row it lights is the row that grew', () => {
    // ARRANGE
    const rest = restHeights(UNITS, TOTAL, FULL);
    const pointers = [40, 120, 200, 300];
    // ACT
    const found = pointers.map((y) => {
      const at = anchorIndex(rest, y, FULL);
      return pointerIndex(dockHeights(rest, at, FULL), y) - at;
    });
    // ASSERT
    expect(found.every((gap) => Math.abs(gap) < TOLERANCE)).toBe(true);
  });
});

describe('failure cases', () => {
  it('never lets a row fall under the minimum, even with many near-empty rows', () => {
    // ARRANGE
    const units = [40, ...Array.from({ length: 30 }, () => 1)];
    const total = 200;
    // ACT
    const rest = restHeights(units, total, FULL);
    const docked = dockHeights(rest, 0, FULL);
    // ASSERT
    expect(Math.min(...rest)).toBeGreaterThanOrEqual(MIN_ROW);
    expect(Math.min(...docked)).toBeGreaterThanOrEqual(MIN_ROW - EPS);
    expect(near(sum(rest), total)).toBe(true);
  });

  it('returns nothing for no rows', () => {
    // ARRANGE
    const expected: number[] = [];
    // ACT
    const actual = [restHeights([], TOTAL, FULL), dockHeights([], 0, FULL)];
    // ASSERT
    expect(actual).toEqual([expected, expected]);
  });
});

describe('edge cases', () => {
  it('leaves rows beyond three away from the pointer at their resting height or smaller', () => {
    // ARRANGE
    const rest = restHeights(UNITS, TOTAL, FULL);
    // ACT
    const docked = dockHeights(rest, 0, FULL);
    // ASSERT
    expect(docked.slice(REACH + 1).every((h, i) => h <= (rest[i + REACH + 1] ?? 0) + EPS)).toBe(true);
  });

  it('is the resting layout when the pointer is away', () => {
    // ARRANGE
    const rest = restHeights(UNITS, TOTAL, FULL);
    // ACT
    const docked = dockHeights(rest, null, FULL);
    // ASSERT
    expect(docked).toEqual(rest);
  });
});
