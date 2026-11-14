import { describe, expect, it } from 'vitest';
import {
  bubbleShape,
  crescentFacets,
  depthScaleForKeel,
  icebergExtent,
  icebergLayers,
  rayWedges,
  scatter,
  sunFacets,
} from './scenery.pure';

/*
 * The scenery's geometry: which layers each part of the iceberg draws, how far its keel reaches, and the seeded scatter
 * that places a school of fish or a column of bubbles the same way on every render.
 */

describe('success cases', () => {
  it('draws the tip, the keel and the waterline glow for the whole iceberg', () => {
    // ARRANGE
    const expected = { tip: true, keel: true, glow: true };
    // ACT
    const layers = icebergLayers('whole');
    // ASSERT
    expect(layers).toEqual(expected);
  });

  it('draws only the keel once the Scene is below the waterline', () => {
    // ARRANGE
    const expected = { tip: false, keel: true, glow: false };
    // ACT
    const layers = icebergLayers('keel');
    // ASSERT
    expect(layers).toEqual(expected);
  });

  it('stretches the keel so its point lands where the Scene asks, 250 m into the Twilight zone', () => {
    // ARRANGE
    const waterline = 400;
    const keelY = 575;
    const expected = 0.875;
    // ACT
    const scale = depthScaleForKeel(waterline, keelY);
    // ASSERT
    expect(scale).toBe(expected);
  });

  it('reports how far the whole iceberg reaches above and below the waterline at a scale', () => {
    // ARRANGE
    const expected = { top: -84, bottom: 150, halfWidth: 95 };
    // ACT
    const extent = icebergExtent('whole', 0.5, 1.5);
    // ASSERT
    expect(extent).toEqual(expected);
  });

  it('scatters the same group for the same seed, so every render draws the same sea', () => {
    // ARRANGE
    const options = { count: 11, seed: 7, spread: [110, 32], gap: [39, 21] } as const;
    const first = scatter(options);
    // ACT
    const second = scatter(options);
    // ASSERT
    expect(second).toEqual(first);
  });

  it('draws the sun as a fan of twelve triangles, the ones toward the upper left lit', () => {
    // ARRANGE
    const sides = 12;
    const litSides = 6;
    // ACT
    const facets = sunFacets(30);
    // ASSERT
    expect({ sides: facets.length, lit: facets.filter((f) => f.lit).length }).toEqual({ sides, lit: litSides });
  });
});

describe('failure cases', () => {
  it('refuses a keel above the waterline, which would turn the iceberg upside down', () => {
    // ARRANGE
    const expected = /below the waterline/;
    // ACT
    const stretch = () => depthScaleForKeel(400, 380);
    // ASSERT
    expect(stretch).toThrow(expected);
  });

  it('refuses a group of a fractional count', () => {
    // ARRANGE
    const expected = /whole count/;
    // ACT
    const place = () => scatter({ count: 2.5, seed: 1, spread: [10, 10], gap: [1, 1] });
    // ASSERT
    expect(place).toThrow(expected);
  });

  it('refuses an iceberg drawn at no size', () => {
    // ARRANGE
    const expected = /positive scale/;
    // ACT
    const measure = () => icebergExtent('tip', 0);
    // ASSERT
    expect(measure).toThrow(expected);
  });

  it('refuses a negative number of rays', () => {
    // ARRANGE
    const expected = /whole count/;
    // ACT
    const draw = () => rayWedges({ count: -1, spread: 70, length: 200, seed: 1 });
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps every member of a scattered group clear of the others', () => {
    // ARRANGE
    const gap = [30, 16] as const;
    const fish = scatter({ count: 11, seed: 3, spread: [110, 32], gap });
    // ACT
    const crowded = fish.flatMap((a, i) =>
      fish.slice(i + 1).filter((b) => Math.abs(a.x - b.x) < gap[0] && Math.abs(a.y - b.y) < gap[1]),
    );
    // ASSERT
    expect(crowded).toEqual([]);
  });

  it('places fewer members than asked when the box is too crowded, never overlapping ones', () => {
    // ARRANGE
    const asked = 40;
    // ACT
    const placed = scatter({ count: asked, seed: 1, spread: [20, 10], gap: [30, 16] });
    // ASSERT
    expect(placed.length).toBeLessThan(asked);
  });

  it('draws only the tip above the waterline, so nothing reaches below it', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const { bottom } = icebergExtent('tip');
    // ASSERT
    expect(bottom).toBe(expected);
  });

  it('cuts the crescent into six quads from horn to horn', () => {
    // ARRANGE
    const quads = 6;
    const corners = 4;
    // ACT
    const facets = crescentFacets(40);
    // ASSERT
    expect(facets.map((f) => f.points.split(' ').length)).toEqual(Array.from({ length: quads }, () => corners));
  });

  it('draws a bubble as a hexagon with a three-point glint', () => {
    // ARRANGE
    const expected = { body: 6, glint: 3 };
    // ACT
    const { body, glint } = bubbleShape(6);
    // ASSERT
    expect({ body: body.split(' ').length, glint: glint.split(' ').length }).toEqual(expected);
  });
});
