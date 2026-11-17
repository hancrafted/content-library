import { describe, expect, it } from 'vitest';
import { placeIceberg, placeIcebergInBands } from './iceberg-placement.pure';
import { icebergExtent } from './scenery.pure';

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

  it('reads the Sunlit bottom and the Twilight depth from the band list a Scene draws', () => {
    // ARRANGE
    const bands = [
      { zone: 'surface', top: 0, bottom: 710 },
      { zone: 'sunlit', top: 710, bottom: 810 },
      { zone: 'twilight', top: 810, bottom: 885 },
      { zone: 'midnight', top: 885, bottom: 960 },
    ] as const;
    const frame = { x: 1000, waterline: 710, scale: 0.5 };
    const expected = { ...frame, depthScale: expect.closeTo(1.15) };
    // ACT
    const placed = placeIcebergInBands(bands, frame);
    // ASSERT
    expect(placed).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a band list without a Sunlit or a Twilight band to place the berg in', () => {
    // ARRANGE
    const expected = /no twilight band/;
    const bands = [
      { zone: 'surface', top: 0, bottom: 400 },
      { zone: 'sunlit', top: 400, bottom: 500 },
    ] as const;
    // ACT
    const place = () => placeIcebergInBands(bands, { x: 0, waterline: 400, scale: 1 });
    // ASSERT
    expect(place).toThrow(expected);
  });

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
