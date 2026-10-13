import { describe, expect, it } from 'vitest';
import {
  dotDelayMs,
  gapFadeDelayMs,
  LINE_DRAW_MS,
  RAIL_ITEMS,
  railSide,
  runsAcross,
  segmentHalves,
  segmentTiming,
  stopKind,
} from './horizontal-rail.pure';

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

  it('dashes the line only between the last hand-over at 10:30 and the first check-in at 13:00', () => {
    // ARRANGE
    const expected = [
      [false, false],
      [false, false],
      [false, false],
      [false, true],
      [true, false],
      [false, false],
    ];
    // ACT
    const dashed = RAIL_ITEMS.map((_, index) => segmentHalves(index, RAIL_ITEMS.length).map((half) => half.dashed));
    // ASSERT
    expect(dashed).toEqual(expected);
  });

  it('draws each column in two halves that keep the one-stroke timing of its segment', () => {
    // ARRANGE
    const count = 6;
    const half = LINE_DRAW_MS / count / 2;
    const expected = [
      { delayMs: 2 * half * 2, durationMs: half },
      { delayMs: 2 * half * 2 + half, durationMs: half },
    ];
    // ACT
    const timings = segmentHalves(2, count).map(({ delayMs, durationMs }) => ({ delayMs, durationMs }));
    // ASSERT
    expect(timings).toEqual(expected);
  });

  it('marks the four morning stops as hand-overs and 13:00 and 16:00 as check-ins', () => {
    // ARRANGE
    const expected = ['hand-over', 'hand-over', 'hand-over', 'hand-over', 'check-in', 'check-in'];
    // ACT
    const kinds = RAIL_ITEMS.map((item) => stopKind(item));
    // ASSERT
    expect(kinds).toEqual(expected);
  });

  it('fades the dashed gap in with the 13:00 dot instead of drawing it', () => {
    // ARRANGE
    const count = 6;
    const expected = (LINE_DRAW_MS * 9) / 12;
    // ACT
    const delay = gapFadeDelayMs(count);
    // ASSERT
    expect(delay).toBe(expected);
  });

  it('runs across once the rail itself is 64rem wide', () => {
    // ARRANGE
    const remPx = 16;
    const width = 1024;
    // ACT
    const across = runsAcross(width, remPx);
    // ASSERT
    expect(across).toBe(true);
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

  it('runs down when the rail is narrower than 64rem, even on a wide viewport with the drawer beside', () => {
    // ARRANGE
    const remPx = 16;
    const foregroundBesideDrawer = 624;
    // ACT
    const across = runsAcross(foregroundBesideDrawer, remPx);
    // ASSERT
    expect(across).toBe(false);
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
