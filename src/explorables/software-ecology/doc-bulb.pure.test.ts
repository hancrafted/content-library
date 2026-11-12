import { describe, expect, it } from 'vitest';
import { bulb } from './doc-gift.ts';
import { BULB_AT } from './doc-sprites.ts';
import type { Colors, Ctx } from './doc-types.ts';

/*
 * The own-work lightbulb sits in the middle of its document (feedback 11): a recording canvas gathers the vertical
 * extent of everything the bulb draws, in sprite units around the document's centre (0, 0).
 */
const COLORS = { bulb: 'yellow', bulbEdge: 'gold', fg: 'black' } as unknown as Colors;

const extentOf = (at: { x: number; y: number }) => {
  const ys: number[] = [];
  const xs: number[] = [];
  let origin = { x: 0, y: 0 };
  const c = {
    save: () => undefined,
    restore: () => undefined,
    translate: (x: number, y: number) => (origin = { x, y }),
    beginPath: () => undefined,
    fill: () => undefined,
    stroke: () => undefined,
    arc: (x: number, y: number, r: number) => {
      ys.push(origin.y + y - r, origin.y + y + r);
      xs.push(origin.x + x - r, origin.x + x + r);
    },
    fillRect: (...r: number[]) => {
      const [x = 0, y = 0, w = 0, h = 0] = r;
      ys.push(origin.y + y, origin.y + y + h);
      xs.push(origin.x + x, origin.x + x + w);
    },
  } as unknown as Ctx;
  bulb(c, COLORS, at);
  return { y: (Math.min(...ys) + Math.max(...ys)) / 2, x: (Math.min(...xs) + Math.max(...xs)) / 2 };
};

const ROUND = 100;
const rounded = (n: number) => Math.round(n * ROUND) / ROUND;

describe('success cases', () => {
  it("centres the bulb and its base on the document's middle", () => {
    // ARRANGE
    const expected = { x: 0, y: 0 };
    // ACT
    const centre = extentOf(BULB_AT);
    const found = { x: rounded(centre.x), y: rounded(centre.y) };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('is off centre at the old position, which sat high on the sheet', () => {
    // ARRANGE
    const old = { x: 0.2, y: -2.4 };
    // ACT
    const centre = extentOf(old);
    // ASSERT
    expect(rounded(centre.y)).toBeLessThan(0);
  });
});

describe('edge cases', () => {
  it('keeps the bulb inside the sheet, which is 11.5 units high', () => {
    // ARRANGE
    const sheetHalf = 5.75;
    // ACT
    const centre = extentOf(BULB_AT);
    // ASSERT
    expect(Math.abs(centre.y)).toBeLessThan(sheetHalf);
  });
});
