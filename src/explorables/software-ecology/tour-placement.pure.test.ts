import { describe, expect, it } from 'vitest';
import { placeTour } from './tour-placement.pure.ts';

/* Where the tour caption sits, as the reference build's `placeTour` puts it: below its card, else above. */

const WRAP = { left: 100, top: 50, width: 1200, height: 700 };

describe('success cases', () => {
  it('sits below its card, centred on it, its tail at the card’s middle', () => {
    // ARRANGE
    const card = { left: 600, top: 100, width: 200, height: 100 };
    const expected = { side: 'below', left: 410, top: 162, width: 380, tail: 190 };
    // ACT
    const place = placeTour({ card, wrap: WRAP, box: { height: 200 } });
    // ASSERT
    expect(place).toEqual(expected);
  });

  it('sits above its card when there is no room below', () => {
    // ARRANGE
    const card = { left: 600, top: 600, width: 200, height: 100 };
    const expected = { side: 'above', left: 410, top: 338, width: 380, tail: 190 };
    // ACT
    const place = placeTour({ card, wrap: WRAP, box: { height: 200 } });
    // ASSERT
    expect(place).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('waits in the stage’s corner without a card to point at', () => {
    // ARRANGE
    const expected = { side: 'none', left: 12, top: 12, width: 380, tail: 0 };
    // ACT
    const place = placeTour({ card: null, wrap: WRAP, box: { height: 200 } });
    // ASSERT
    expect(place).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('stays 8 px inside the stage at its right edge, its tail still on the card, and narrows on a small stage', () => {
    // ARRANGE
    const card = { left: 1250, top: 100, width: 40, height: 60 };
    const small = { left: 0, top: 0, width: 300, height: 700 };
    const expected = { side: 'below', left: 812, top: 122, width: 380, tail: 358 };
    const narrow = 276;
    // ACT
    const place = placeTour({ card, wrap: WRAP, box: { height: 200 } });
    const thin = placeTour({ card: null, wrap: small, box: { height: 200 } });
    // ASSERT
    expect(place).toEqual(expected);
    expect(thin.width).toBe(narrow);
  });
});
