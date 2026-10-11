import { describe, expect, it } from 'vitest';
import {
  canvasShare,
  contrastRatio,
  DRAW_MS,
  LANE_COLOURS,
  LANE_ROUTES,
  LANES,
  litLanes,
  metroPath,
  PAGE_BACKGROUND,
  placePopover,
  POPOVER_MAX_WIDTH,
  stationDelayMs,
  stationLanes,
  STATIONS,
} from './metro-map.pure';

const DESKTOP = { width: 1440, height: 900 };

describe('success cases', () => {
  it('draws a straight run as one line from the first point to the last', () => {
    // ARRANGE
    const run = [
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ];
    const expected = 'M 0 50 L 200 50';
    // ACT
    const path = metroPath(run, 10);
    // ASSERT
    expect(path).toBe(expected);
  });

  it('draws every lane at metro angles only', () => {
    // ARRANGE
    const radius = 16;
    // ACT
    const draw = () => LANES.map((lane) => metroPath(LANE_ROUTES[lane], radius));
    // ASSERT
    expect(draw).not.toThrow();
  });

  it('branches and merges the lanes: interchanges where they meet, single stations where they run apart', () => {
    // ARRANGE
    const expected = { a: ['a', 'b', 'c'], b: ['b'], c: ['a', 'b'], d: ['c'], e: ['a', 'b', 'c'], f: ['b'] };
    // ACT
    const served = Object.fromEntries(STATIONS.map((station) => [station, stationLanes(station)]));
    // ASSERT
    expect(served).toEqual(expected);
  });

  it('lights only the lanes a hovered station serves', () => {
    // ARRANGE
    const expected = ['a', 'b'];
    // ACT
    const lit = litLanes({ station: 'c' });
    // ASSERT
    expect(lit).toEqual(expected);
  });

  it('lights only the hovered legend lane', () => {
    // ARRANGE
    const expected = ['c'];
    // ACT
    const lit = litLanes({ lane: 'c' });
    // ASSERT
    expect(lit).toEqual(expected);
  });

  it('keeps every lane colour at 3:1 or more against the page in both themes', () => {
    // ARRANGE
    const minimum = 3;
    // ACT
    const lowest = Math.min(
      ...LANES.flatMap((lane) => [
        contrastRatio(LANE_COLOURS[lane].light, PAGE_BACKGROUND.light),
        contrastRatio(LANE_COLOURS[lane].dark, PAGE_BACKGROUND.dark),
      ]),
    );
    // ASSERT
    expect(lowest).toBeGreaterThanOrEqual(minimum);
  });

  it('opens a station’s popover below it, centred on it', () => {
    // ARRANGE
    const anchor = { top: 300, left: 600, width: 40, height: 40 };
    const gap = 12;
    const expected = {
      side: 'below',
      top: anchor.top + anchor.height + gap,
      left: anchor.left + anchor.width / 2 - POPOVER_MAX_WIDTH / 2,
      width: POPOVER_MAX_WIDTH,
    };
    // ACT
    const placement = placePopover(anchor, DESKTOP);
    // ASSERT
    expect(placement).toEqual(expected);
  });

  it('places HTML over the SVG at the point’s share of the canvas', () => {
    // ARRANGE
    const centre = { x: 500, y: 190 };
    const expected = { left: '50%', top: '50%' };
    // ACT
    const share = canvasShare(centre);
    // ASSERT
    expect(share).toEqual(expected);
  });

  it('shows stations left to right as the lines reach them, all within the draw', () => {
    // ARRANGE
    const draw = DRAW_MS;
    // ACT
    const delays = STATIONS.map(stationDelayMs);
    // ASSERT
    expect(delays).toEqual([...delays].sort((x, y) => x - y));
    expect(Math.max(...delays)).toBeLessThanOrEqual(draw);
  });
});

describe('failure cases', () => {
  it('refuses a segment that is neither straight nor at 45°', () => {
    // ARRANGE
    const crooked = [
      { x: 0, y: 0 },
      { x: 30, y: 10 },
    ];
    const offending = '30 10';
    // ACT
    const path = () => metroPath(crooked, 10);
    // ASSERT
    expect(path).toThrow(offending);
  });

  it('refuses a colour that is not a six-digit hex', () => {
    // ARRANGE
    const named = 'tomato';
    // ACT
    const ratio = () => contrastRatio(named, PAGE_BACKGROUND.light);
    // ASSERT
    expect(ratio).toThrow(named);
  });

  it('refuses a route with no points', () => {
    // ARRANGE
    const empty: { x: number; y: number }[] = [];
    const reason = 'no points';
    // ACT
    const path = () => metroPath(empty, 10);
    // ASSERT
    expect(path).toThrow(reason);
  });
});

describe('edge cases', () => {
  it('rounds a 45° bend with a curve that starts and ends one radius from the corner, to two decimals', () => {
    // ARRANGE
    const bend = [
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 200, y: 0 },
    ];
    const radius = 10;
    const expected = 'M 0 100 L 90 100 Q 100 100 107.07 92.93 L 200 0';
    // ACT
    const path = metroPath(bend, radius);
    // ASSERT
    expect(path).toBe(expected);
  });

  it('lights every lane when nothing is hovered', () => {
    // ARRANGE
    const expected = [...LANES];
    // ACT
    const lit = litLanes(null);
    // ASSERT
    expect(lit).toEqual(expected);
  });

  it('flips the popover above a station near the bottom of the viewport', () => {
    // ARRANGE
    const anchor = { top: 820, left: 600, width: 40, height: 40 };
    const gap = 12;
    const expected = { side: 'above', bottom: DESKTOP.height - anchor.top + gap };
    // ACT
    const placement = placePopover(anchor, DESKTOP);
    // ASSERT
    expect(placement).toMatchObject(expected);
  });

  it('keeps the popover inside a phone viewport, narrowed to fit', () => {
    // ARRANGE
    const phone = { width: 240, height: 700 };
    const margin = 16;
    const anchor = { top: 200, left: 220, width: 20, height: 20 };
    const expected = { left: margin, width: phone.width - 2 * margin };
    // ACT
    const placement = placePopover(anchor, phone);
    // ASSERT
    expect(placement).toMatchObject(expected);
  });
});
