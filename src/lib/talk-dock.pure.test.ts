import { describe, expect, it } from 'vitest';
import {
  DOCK_WIDTH_REM,
  HEADER_REM,
  dockedHeightRem,
  flipTransform,
  placementOf,
  shouldDock,
  tocReserveRem,
  type Rect,
} from './talk-dock.pure';

const SLOT: Rect = { left: 300, top: 400, width: 600, height: 337.5 };

describe('success cases', () => {
  it('docks once the reader leaves the Title slide on a wide screen', () => {
    // ARRANGE
    const input = { active: 'intro', wide: true };
    // ACT
    const docks = shouldDock(input);
    // ASSERT
    expect(docks).toBe(true);
  });

  it('stays in the slot on the Title slide', () => {
    // ARRANGE
    const input = { active: 'top', wide: true };
    // ACT
    const docks = shouldDock(input);
    // ASSERT
    expect(docks).toBe(false);
  });

  it('lays the header over the strip above the slot and follows its width', () => {
    // ARRANGE
    const input = { docked: false, slot: SLOT };
    const expected = { left: '0px', top: '0px', bottom: 'auto', width: '600px', translate: '300px 368px' };
    // ACT
    const placement = placementOf(input);
    // ASSERT
    expect(placement).toEqual(expected);
  });

  it('docks to the bottom-left corner at the table of contents width', () => {
    // ARRANGE
    const input = { docked: true, slot: SLOT };
    const expected = { left: '1rem', top: 'auto', bottom: '1rem', width: '17rem', translate: 'none' };
    // ACT
    const placement = placementOf(input);
    // ASSERT
    expect(placement).toEqual(expected);
  });

  it('maps the new box back onto the old one with a translate and a uniform scale', () => {
    // ARRANGE
    const first: Rect = { left: 300, top: 368, width: 600, height: 369.5 };
    const last: Rect = { left: 16, top: 500, width: 300, height: 184.75 };
    const expected = 'translate(284px, -132px) scale(2)';
    // ACT
    const transform = flipTransform(first, last);
    // ASSERT
    expect(transform).toBe(expected);
  });

  it('is a 17rem wide card whose frame is 16:9 under a 2rem header, and the table of contents gives up its height and a gap', () => {
    // ARRANGE
    const expected = [17, 2, 11.5625, 12.5625];
    // ACT
    const geometry = [DOCK_WIDTH_REM, HEADER_REM, dockedHeightRem(), tocReserveRem()];
    // ASSERT
    expect(geometry).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never docks below lg', () => {
    // ARRANGE
    const input = { active: 'intro', wide: false };
    // ACT
    const docks = shouldDock(input);
    // ASSERT
    expect(docks).toBe(false);
  });

  it('returns no glide for an empty box, which has nothing to move', () => {
    // ARRANGE
    const empty: Rect = { left: 0, top: 0, width: 0, height: 0 };
    // ACT
    const transform = flipTransform(empty, SLOT);
    // ASSERT
    expect(transform).toBeNull();
  });
});

describe('edge cases', () => {
  it('stays in the slot while the active Slide is unknown', () => {
    // ARRANGE
    const input = { active: null, wide: true };
    // ACT
    const docks = shouldDock(input);
    // ASSERT
    expect(docks).toBe(false);
  });

  it('docks even before the slot is measured', () => {
    // ARRANGE
    const input = { docked: true, slot: null };
    // ACT
    const placement = placementOf(input);
    // ASSERT
    expect(placement.bottom).toBe('1rem');
  });

  it('parks off screen when undocked with no slot to follow', () => {
    // ARRANGE
    const input = { docked: false, slot: null };
    // ACT
    const placement = placementOf(input);
    // ASSERT
    expect(placement.translate).toBe('0px -100vh');
  });

  it('is the identity glide when nothing moved', () => {
    // ARRANGE
    const box: Rect = { left: 10, top: 20, width: 100, height: 50 };
    // ACT
    const transform = flipTransform(box, box);
    // ASSERT
    expect(transform).toBe('translate(0px, 0px) scale(1)');
  });
});
