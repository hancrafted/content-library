import { describe, expect, it } from 'vitest';
import { placeSettings } from './settings-placement.pure.ts';

/** A 1440 × 900 window, the Settings button at the toolbar's right end. */
const LAPTOP = { width: 1440, height: 900 };
const BUTTON = { left: 1180, top: 120, width: 36, height: 36 };

describe('success cases', () => {
  it('opens 720 wide under the Settings button, its right edge on the button’s', () => {
    // ARRANGE
    const expected = { x: 496, y: 162, width: 720, maxHeight: 730 };
    // ACT
    const place = placeSettings({ button: BUTTON, view: LAPTOP });
    // ASSERT
    expect(place).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('slides right to stay 8 px inside the window when the button sits near the left edge', () => {
    // ARRANGE
    const button = { ...BUTTON, left: 200 };
    const expected = { x: 8, width: 720 };
    // ACT
    const place = placeSettings({ button, view: LAPTOP });
    // ASSERT
    expect(place).toMatchObject(expected);
  });
});

describe('edge cases', () => {
  it('narrows to the window less 8 px each side on a phone, and rises to keep 420 px of room when the button sits low', () => {
    // ARRANGE
    const phone = { width: 375, height: 667 };
    const button = { left: 320, top: 400, width: 36, height: 36 };
    const expected = { x: 8, y: 239, width: 359, maxHeight: 420 };
    // ACT
    const place = placeSettings({ button, view: phone });
    // ASSERT
    expect(place).toMatchObject(expected);
  });
});
