import { describe, expect, it } from 'vitest';
import {
  dotDelayMs,
  LINE_DRAW_MS,
  placeToggletip,
  RAIL_ITEMS,
  railSide,
  segmentTiming,
  TOGGLETIP_MAX_WIDTH,
} from './horizontal-rail.pure';

const DESKTOP = { width: 1440, height: 900 };

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

  it('opens an above label’s toggletip above it, centred on the label, its arrow on the centre', () => {
    // ARRANGE
    const anchor = { top: 400, left: 600, width: 120, height: 60 };
    const gap = 12;
    const expected = {
      side: 'above',
      bottom: DESKTOP.height - anchor.top + gap,
      left: anchor.left + anchor.width / 2 - TOGGLETIP_MAX_WIDTH / 2,
      width: TOGGLETIP_MAX_WIDTH,
      arrowX: TOGGLETIP_MAX_WIDTH / 2,
    };
    // ACT
    const placement = placeToggletip({ anchor, viewport: DESKTOP, side: 'above' });
    // ASSERT
    expect(placement).toEqual(expected);
  });

  it('opens a below label’s toggletip under it', () => {
    // ARRANGE
    const anchor = { top: 400, left: 600, width: 120, height: 60 };
    const gap = 12;
    const expectedTop = anchor.top + anchor.height + gap;
    // ACT
    const placement = placeToggletip({ anchor, viewport: DESKTOP, side: 'below' });
    // ASSERT
    expect(placement).toMatchObject({ side: 'below', top: expectedTop });
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
  it('flips to the other side when the preferred side has no room', () => {
    // ARRANGE
    const anchor = { top: 40, left: 600, width: 120, height: 60 };
    const expected = 'below';
    // ACT
    const placement = placeToggletip({ anchor, viewport: DESKTOP, side: 'above' });
    // ASSERT
    expect(placement.side).toBe(expected);
  });

  it('clamps the toggletip inside a phone viewport and still points its arrow at the label', () => {
    // ARRANGE
    const phone = { width: 375, height: 700 };
    const margin = 16;
    const anchor = { top: 300, left: 300, width: 60, height: 40 };
    const expectedLeft = phone.width - margin - TOGGLETIP_MAX_WIDTH;
    const expectedArrowX = anchor.left + anchor.width / 2 - expectedLeft;
    // ACT
    const placement = placeToggletip({ anchor, viewport: phone, side: 'below' });
    // ASSERT
    expect(placement).toMatchObject({ left: expectedLeft, arrowX: expectedArrowX });
  });

  it('narrows the toggletip to a viewport slimmer than its widest', () => {
    // ARRANGE
    const slim = { width: 240, height: 700 };
    const margin = 16;
    const anchor = { top: 300, left: 40, width: 60, height: 40 };
    const expected = { left: margin, width: slim.width - 2 * margin };
    // ACT
    const placement = placeToggletip({ anchor, viewport: slim, side: 'below' });
    // ASSERT
    expect(placement).toMatchObject(expected);
  });
});
