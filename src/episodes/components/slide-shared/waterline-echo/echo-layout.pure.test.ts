import { describe, expect, it } from 'vitest';
import { sectionTitleBottom, sectionTitleLift, SURFACE_WATERLINE, visibleSpan } from '../iceberg/zone-scene.pure';
import { echoShipSpan, SHIP_REACH } from './echo-layout.pure';

const BOXES = [
  { width: 1920, height: 900 },
  { width: 1440, height: 786 },
  { width: 1280, height: 640 },
  { width: 1024, height: 700 },
  { width: 768, height: 700 },
  { width: 375, height: 812 },
  { width: 375, height: 640 },
];

describe('success cases', () => {
  it("keeps the ship, masthead and all, below the Section title's last line at every width", () => {
    // ARRANGE
    const expected: readonly unknown[] = [];
    // ACT
    const overlapping = BOXES.filter((box) => {
      const lift = sectionTitleLift(box, SHIP_REACH);
      const scale = Math.max(box.width / 1200, (box.height - lift) / 800);
      return lift + (SURFACE_WATERLINE - SHIP_REACH) * scale < sectionTitleBottom(box);
    });
    // ASSERT
    expect(overlapping).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('would cover the title with the ship if the drawing were not lifted on a short tablet', () => {
    // ARRANGE
    const tablet = { width: 1024, height: 700 };
    // ACT
    const masthead = (SURFACE_WATERLINE - SHIP_REACH) * Math.max(tablet.width / 1200, tablet.height / 800);
    // ASSERT
    expect(masthead).toBeLessThan(sectionTitleBottom(tablet));
  });
});

describe('edge cases', () => {
  it('keeps the whole ship and the robot under its A-frame in view on a phone', () => {
    // ARRANGE
    const phones = BOXES.filter(({ width }) => width < 768);
    const expected: readonly unknown[] = [];
    // ACT
    const cut = phones.filter((box) => {
      const lift = sectionTitleLift(box, SHIP_REACH);
      const view = visibleSpan({ width: box.width, height: box.height - lift });
      const ship = echoShipSpan();
      return ship.left < view.left || ship.right > view.right;
    });
    // ASSERT
    expect(cut).toEqual(expected);
  });
});
