import { describe, expect, it } from 'vitest';
import { polyBubbleFacets, toPoints } from './poly-bubble.pure';

/*
 * One faceted air bubble (`PolyBubble`): a 6- to 8-sided outline inside the anchor box (-10..10 on both axes, centred
 * on the origin, whole units only), a lit facet toward the light at the upper left, a shade facet opposite it and one glint.
 */

const centroid = (points: readonly (readonly [number, number])[]) =>
  points.reduce(([sx, sy], [x, y]) => [sx + x / points.length, sy + y / points.length], [0, 0]);

describe('success cases', () => {
  it('draws an outline of as many corners as sides, on whole units inside the anchor box', () => {
    // ARRANGE
    const sides = [6, 7, 8] as const;
    const box = 10;
    const expected = { corners: [6, 7, 8], outside: [] };
    // ACT
    const outlines = sides.map((count) => polyBubbleFacets(count).outline);
    const seen = {
      corners: outlines.map((outline) => outline.length),
      outside: outlines
        .flat()
        .filter(([x, y]) => Math.abs(x) > box || Math.abs(y) > box || !Number.isInteger(x) || !Number.isInteger(y)),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lights the facet toward the upper left and shades the one toward the lower right', () => {
    // ARRANGE
    const expected = { lit: { left: true, up: true }, shade: { left: false, up: false } };
    // ACT
    const { lit, shade } = polyBubbleFacets(7);
    const [litX, litY] = centroid(lit);
    const [shadeX, shadeY] = centroid(shade);
    const seen = { lit: { left: litX < 0, up: litY < 0 }, shade: { left: shadeX < 0, up: shadeY < 0 } };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('writes a facet as SVG polygon points', () => {
    // ARRANGE
    const expected = '0,-10 5,3 -3,0';
    // ACT
    const points = toPoints([
      [0, -10],
      [5, 3],
      [-3, 0],
    ]);
    // ASSERT
    expect(points).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses fewer than six sides, more than eight, or part of one', () => {
    // ARRANGE
    const expected = /6 to 8 sides/;
    // ACT
    const attempts = [5, 9, 6.5].map((sides) => () => polyBubbleFacets(sides));
    // ASSERT
    attempts.forEach((attempt) => expect(attempt).toThrow(expected));
  });
});

describe('edge cases', () => {
  it('draws the same bubble every time for the same number of sides', () => {
    // ARRANGE
    const sides = 8;
    // ACT
    const first = JSON.stringify(polyBubbleFacets(sides));
    const again = JSON.stringify(polyBubbleFacets(sides));
    // ASSERT
    expect(again).toBe(first);
  });
});
