import { describe, expect, it } from 'vitest';
import { placeIceberg } from './iceberg-placement.pure';
import { icebergExtent } from './scenery.pure';

/*
 * The one iceberg placement every Scene uses (the title hero, `ZoneScene`, `WholeDepthScene`): the body floats in the
 * Sunlit zone and the keel's point only touches the Twilight zone, a fifth of the way into it, at any scale.
 */

describe('success cases', () => {
  it('reaches the keel a fifth of the way into the Twilight zone, whatever the berg scale', () => {
    // ARRANGE
    const frame = { x: 1000, waterline: 710, sunlitBottom: 810, twilightDepth: 75 };
    const keelY = 825;
    // ACT
    const keels = [0.5, 0.8].map((scale) => {
      const placed = placeIceberg({ ...frame, scale });
      return placed.waterline + icebergExtent('whole', placed.scale, placed.depthScale).bottom;
    });
    // ASSERT
    expect(keels).toEqual([expect.closeTo(keelY), expect.closeTo(keelY)]);
  });

  it('hands the Iceberg its centre, waterline and scale unchanged', () => {
    // ARRANGE
    const expected = { x: 900, waterline: 400, scale: 0.8 };
    // ACT
    const { x, waterline, scale } = placeIceberg({ ...expected, sunlitBottom: 800, twilightDepth: 100 });
    // ASSERT
    expect({ x, waterline, scale }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a Sunlit zone that ends above the waterline', () => {
    // ARRANGE
    const expected = /Sunlit zone must end below the waterline \(400\), got 380/;
    // ACT
    const place = () => placeIceberg({ x: 0, waterline: 400, scale: 1, sunlitBottom: 380, twilightDepth: 100 });
    // ASSERT
    expect(place).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('refuses a Twilight zone of no depth or a berg of no size', () => {
    // ARRANGE
    const expected = /positive/;
    // ACT
    const flat = () => placeIceberg({ x: 0, waterline: 0, scale: 1, sunlitBottom: 100, twilightDepth: 0 });
    const none = () => placeIceberg({ x: 0, waterline: 0, scale: 0, sunlitBottom: 100, twilightDepth: 50 });
    // ASSERT
    expect(flat).toThrow(expected);
    expect(none).toThrow(expected);
  });
});
