import { describe, expect, it } from 'vitest';
import { dotDelayMs, LINE_DRAW_MS, RAIL_ITEMS, railSide, segmentTiming } from './horizontal-rail.pure';

describe('success cases', () => {
  it('alternates labels above and below the line, starting above', () => {
    // ARRANGE
    const expected = ['above', 'below', 'above', 'below', 'above', 'below'];
    // ACT
    const sides = RAIL_ITEMS.map((_, index) => railSide(index));
    // ASSERT
    expect(sides).toEqual(expected);
  });

  it('pops each dot in as the drawing line reaches its centre', () => {
    // ARRANGE
    const count = 4;
    const expected = [LINE_DRAW_MS / 8, (LINE_DRAW_MS * 3) / 8, (LINE_DRAW_MS * 5) / 8, (LINE_DRAW_MS * 7) / 8];
    // ACT
    const delays = [0, 1, 2, 3].map((index) => dotDelayMs(index, count));
    // ASSERT
    expect(delays).toEqual(expected);
  });

  it('draws the line as one stroke: each column’s segment starts where the previous one ends', () => {
    // ARRANGE
    const count = 4;
    const share = LINE_DRAW_MS / count;
    const expected = [0, 1, 2, 3].map((index) => ({ delayMs: share * index, durationMs: share }));
    // ACT
    const timings = [0, 1, 2, 3].map((index) => segmentTiming(index, count));
    // ASSERT
    expect(timings).toEqual(expected);
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

  it('refuses a dot past the end of the rail instead of delaying it past the line', () => {
    // ARRANGE
    const count = 6;
    const past = count;
    // ACT
    const delay = () => dotDelayMs(past, count);
    // ASSERT
    expect(delay).toThrow(String(past));
  });

  it('refuses a segment on an empty rail', () => {
    // ARRANGE
    const count = 0;
    // ACT
    const timing = () => segmentTiming(0, count);
    // ASSERT
    expect(timing).toThrow(String(count));
  });
});

describe('edge cases', () => {
  it('pops the only dot of a one-stop rail in halfway through the line', () => {
    // ARRANGE
    const count = 1;
    const expected = LINE_DRAW_MS / 2;
    // ACT
    const delay = dotDelayMs(0, count);
    // ASSERT
    expect(delay).toBe(expected);
  });
});
