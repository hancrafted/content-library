import { describe, expect, it } from 'vitest';
import { RAIL_ITEMS, railSide } from './horizontal-rail.pure';

describe('success cases', () => {
  it('alternates labels above and below the line, starting above', () => {
    // ARRANGE
    const expected = ['above', 'below', 'above', 'below', 'above', 'below'];
    // ACT
    const sides = RAIL_ITEMS.map((_, index) => railSide(index));
    // ASSERT
    expect(sides).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a position that is not on the rail', () => {
    // ARRANGE
    const stray = -2;
    // ACT
    const side = () => railSide(stray);
    // ASSERT
    expect(side).toThrow(String(stray));
  });

  it('refuses a position between two stops', () => {
    // ARRANGE
    const between = 1.5;
    // ACT
    const side = () => railSide(between);
    // ASSERT
    expect(side).toThrow(String(between));
  });
});

describe('edge cases', () => {
  it('keeps alternating on a rail far longer than six stops', () => {
    // ARRANGE
    const farStop = 101;
    const expected = 'below';
    // ACT
    const side = railSide(farStop);
    // ASSERT
    expect(side).toBe(expected);
  });
});
