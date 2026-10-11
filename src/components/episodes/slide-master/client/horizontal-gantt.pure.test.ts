import { describe, expect, it } from 'vitest';
import {
  barBox,
  elapsedShare,
  GANTT_BARS,
  GANTT_LANES,
  growTiming,
  laneClashes,
  placeTooltip,
  SWEEP_MS,
  TOOLTIP_GAP,
  TOOLTIP_MARGIN,
  TOOLTIP_MAX_WIDTH,
} from './horizontal-gantt.pure';

const DESKTOP = { width: 1440, height: 900 };

describe('success cases', () => {
  it('places a bar as a share of the track, measured from the year’s start', () => {
    // ARRANGE
    const bar = { lane: 'a', start: 3, end: 6 } as const;
    const expected = { leftPct: 25, widthPct: 25 };
    // ACT
    const box = barBox(bar);
    // ASSERT
    expect(box).toEqual(expected);
  });

  it('fills the share of a bar that today has already passed', () => {
    // ARRANGE
    const bar = { lane: 'a', start: 4, end: 8 } as const;
    const today = 7;
    const expected = 0.75;
    // ACT
    const share = elapsedShare(bar, today);
    // ASSERT
    expect(share).toBe(expected);
  });

  it('grows a bar when the sweep reaches its start, at the sweep’s pace', () => {
    // ARRANGE
    const bar = { lane: 'b', start: 3, end: 9 } as const;
    const expected = { delayMs: SWEEP_MS / 4, durationMs: SWEEP_MS / 2 };
    // ACT
    const timing = growTiming(bar);
    // ASSERT
    expect(timing).toEqual(expected);
  });

  it('keeps every lane in use and no two bars in one lane overlapping', () => {
    // ARRANGE
    const bars = GANTT_BARS;
    // ACT
    const clashes = laneClashes(bars);
    const lanesInUse = [...new Set(Object.values(bars).map((bar) => bar.lane))].sort();
    // ASSERT
    expect(clashes).toEqual([]);
    expect(lanesInUse).toEqual([...GANTT_LANES]);
  });

  it('opens a bar’s tooltip above it, centred on the bar', () => {
    // ARRANGE
    const anchor = { top: 500, left: 400, width: 300, height: 40 };
    const expected = {
      side: 'above',
      bottom: DESKTOP.height - anchor.top + TOOLTIP_GAP,
      left: anchor.left + anchor.width / 2 - TOOLTIP_MAX_WIDTH / 2,
      width: TOOLTIP_MAX_WIDTH,
    };
    // ACT
    const placement = placeTooltip(anchor, DESKTOP);
    // ASSERT
    expect(placement).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a bar that ends before it starts', () => {
    // ARRANGE
    const bar = { lane: 'a', start: 6, end: 3 } as const;
    const message = '6–3 is not a range on a 12-month axis.';
    // ACT
    const place = () => barBox(bar);
    // ASSERT
    expect(place).toThrow(message);
  });

  it('names the pair of bars that overlap in one lane', () => {
    // ARRANGE
    const bars = {
      first: { lane: 'a', start: 0, end: 5 },
      second: { lane: 'a', start: 4, end: 8 },
      apart: { lane: 'b', start: 2, end: 6 },
    } as const;
    const expected = [['first', 'second']];
    // ACT
    const clashes = laneClashes(bars);
    // ASSERT
    expect(clashes).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('spans the whole track for a bar that runs all year', () => {
    // ARRANGE
    const bar = { lane: 'b', start: 0, end: 12 } as const;
    const expected = { leftPct: 0, widthPct: 100 };
    // ACT
    const box = barBox(bar);
    // ASSERT
    expect(box).toEqual(expected);
  });

  it('leaves a bar that starts after today empty, and one that ended before it full', () => {
    // ARRANGE
    const today = 7;
    const ahead = { lane: 'c', start: 9, end: 11 } as const;
    const behind = { lane: 'a', start: 0, end: 2 } as const;
    const expected = [0, 1];
    // ACT
    const shares = [elapsedShare(ahead, today), elapsedShare(behind, today)];
    // ASSERT
    expect(shares).toEqual(expected);
  });

  it('lets one bar start in the month another ends in the same lane', () => {
    // ARRANGE
    const bars = { first: { lane: 'c', start: 0, end: 4 }, second: { lane: 'c', start: 4, end: 7 } } as const;
    // ACT
    const clashes = laneClashes(bars);
    // ASSERT
    expect(clashes).toEqual([]);
  });

  it('flips the tooltip below a bar that sits near the top of the viewport', () => {
    // ARRANGE
    const anchor = { top: 40, left: 400, width: 300, height: 40 };
    const expectedTop = anchor.top + anchor.height + TOOLTIP_GAP;
    const expectedSide = 'below';
    // ACT
    const placement = placeTooltip(anchor, DESKTOP);
    // ASSERT
    expect(placement.side).toBe(expectedSide);
    expect(placement.top).toBe(expectedTop);
  });

  it('narrows the tooltip to a phone and keeps it inside the viewport margins', () => {
    // ARRANGE
    const phone = { width: 280, height: 700 };
    const anchor = { top: 400, left: 200, width: 160, height: 40 };
    const expectedWidth = phone.width - 2 * TOOLTIP_MARGIN;
    // ACT
    const placement = placeTooltip(anchor, phone);
    // ASSERT
    expect(placement.width).toBe(expectedWidth);
    expect(placement.left).toBe(TOOLTIP_MARGIN);
  });
});
