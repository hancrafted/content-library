import { describe, expect, it } from 'vitest';
import { placePopover } from './popover-placement.pure';

const DESKTOP = { width: 1440, height: 900 };
const RULES = { maxWidth: 256, gap: 12, minRoom: 120 };

describe('success cases', () => {
  it('opens above an anchor on the preferred side, centred on it, its arrow on the centre', () => {
    // ARRANGE
    const anchor = { top: 400, left: 600, width: 120, height: 60 };
    const expected = { side: 'above', bottom: 512, left: 532, width: 256, arrowX: 128 };
    // ACT
    const placement = placePopover({ anchor, viewport: DESKTOP, side: 'above', ...RULES });
    // ASSERT
    expect(placement).toEqual(expected);
  });

  it('opens below an anchor that prefers below, its top a gap under the anchor', () => {
    // ARRANGE
    const anchor = { top: 400, left: 600, width: 120, height: 60 };
    const expected = { side: 'below', top: 472, left: 532, width: 256, arrowX: 128 };
    // ACT
    const placement = placePopover({ anchor, viewport: DESKTOP, side: 'below', ...RULES });
    // ASSERT
    expect(placement).toEqual(expected);
  });

  it('honours another Slide’s rules: a wider popover that prefers below', () => {
    // ARRANGE
    const anchor = { top: 300, left: 700, width: 40, height: 40 };
    const metroLike = { maxWidth: 288, gap: 12, minRoom: 180 };
    const expected = { side: 'below', top: 352, left: 576, width: 288, arrowX: 144 };
    // ACT
    const placement = placePopover({ anchor, viewport: DESKTOP, side: 'below', ...metroLike });
    // ASSERT
    expect(placement).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a negative gap instead of overlapping the anchor', () => {
    // ARRANGE
    const anchor = { top: 400, left: 600, width: 120, height: 60 };
    const gap = -12;
    // ACT
    const place = () => placePopover({ anchor, viewport: DESKTOP, side: 'above', ...RULES, gap });
    // ASSERT
    expect(place).toThrow(String(gap));
  });

  it('refuses a width that is not a number', () => {
    // ARRANGE
    const anchor = { top: 400, left: 600, width: 120, height: 60 };
    const maxWidth = Number.NaN;
    const named = 'maxWidth';
    // ACT
    const place = () => placePopover({ anchor, viewport: DESKTOP, side: 'above', ...RULES, maxWidth });
    // ASSERT
    expect(place).toThrow(named);
  });
});

describe('edge cases', () => {
  it('flips below when the room above is short of the least room', () => {
    // ARRANGE
    const anchor = { top: 40, left: 600, width: 120, height: 60 };
    const expected = { side: 'below', top: 112 };
    // ACT
    const placement = placePopover({ anchor, viewport: DESKTOP, side: 'above', ...RULES });
    // ASSERT
    expect(placement).toMatchObject(expected);
  });

  it('flips above when the room below is short of the least room', () => {
    // ARRANGE
    const anchor = { top: 800, left: 600, width: 120, height: 60 };
    const expected = { side: 'above', bottom: 112 };
    // ACT
    const placement = placePopover({ anchor, viewport: DESKTOP, side: 'below', ...RULES });
    // ASSERT
    expect(placement).toMatchObject(expected);
  });

  it('opens on the preferred side when its room equals the least room exactly', () => {
    // ARRANGE
    const anchor = { top: 132, left: 600, width: 120, height: 60 };
    const expected = 'above';
    // ACT
    const placement = placePopover({ anchor, viewport: DESKTOP, side: 'above', ...RULES });
    // ASSERT
    expect(placement.side).toBe(expected);
  });

  it('clamps inside a phone viewport and still points its arrow at the anchor', () => {
    // ARRANGE
    const phone = { width: 375, height: 700 };
    const anchor = { top: 300, left: 300, width: 60, height: 40 };
    const expected = { left: 103, arrowX: 227 };
    // ACT
    const placement = placePopover({ anchor, viewport: phone, side: 'below', ...RULES });
    // ASSERT
    expect(placement).toMatchObject(expected);
  });

  it('narrows to a viewport slimmer than its widest', () => {
    // ARRANGE
    const slim = { width: 240, height: 700 };
    const anchor = { top: 300, left: 40, width: 60, height: 40 };
    const expected = { left: 16, width: 208 };
    // ACT
    const placement = placePopover({ anchor, viewport: slim, side: 'below', ...RULES });
    // ASSERT
    expect(placement).toMatchObject(expected);
  });
});
