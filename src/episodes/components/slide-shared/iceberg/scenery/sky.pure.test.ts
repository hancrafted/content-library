import { describe, expect, it } from 'vitest';
import { SKY_TONES, skyColour, skyFacets, skyTop } from './sky.pure';

describe('success cases', () => {
  it('cuts the sky into a few large facets, longer than tall, in three bands of two neighbouring tones each', () => {
    // ARRANGE
    const sky = { left: 0, width: 1200, height: 425, seed: 3 };
    const expected = { most: 48, tones: ['sky-1', 'sky-2', 'sky-3', 'sky-4'], wide: true };
    // ACT
    const facets = skyFacets(sky);
    const spans = facets.map(({ points }) => {
      const corners = points.split(' ').map((pair) => pair.split(',').map(Number) as [number, number]);
      const xs = corners.map(([x]) => x);
      const ys = corners.map(([, y]) => y);
      return { across: Math.max(...xs) - Math.min(...xs), down: Math.max(...ys) - Math.min(...ys) };
    });
    const seen = {
      count: facets.length,
      tones: [...new Set(facets.map(({ tone }) => tone))].sort(),
      wide: spans.reduce((sum, { across }) => sum + across, 0) > 2 * spans.reduce((sum, { down }) => sum + down, 0),
    };
    // ASSERT
    expect(seen.count).toBeLessThanOrEqual(expected.most);
    expect({ tones: seen.tones, wide: seen.wide }).toEqual({ tones: expected.tones, wide: expected.wide });
  });

  it("keeps the top of the sky in its darkest two tones, the colour a Surface title's wave takes", () => {
    // ARRANGE
    const expected = { tones: ['sky-1', 'sky-2'], wave: skyColour('sky-1') };
    // ACT
    const top = skyFacets({ left: 0, width: 1200, height: 425, seed: 3 }).filter(({ points }) =>
      points.split(' ').some((pair) => pair.endsWith(',0')),
    );
    // ASSERT
    expect({ tones: [...new Set(top.map(({ tone }) => tone))].sort(), wave: skyTop() }).toEqual(expected);
  });

  it('mixes each tone from the Surface zone and the info blue, lighter towards the horizon', () => {
    // ARRANGE
    const expected = [
      'color-mix(in oklab, var(--zone-surface) 64%, var(--info))',
      'color-mix(in oklab, var(--zone-surface) 71%, var(--info))',
      'color-mix(in oklab, var(--zone-surface) 79%, var(--info))',
      'color-mix(in oklab, var(--zone-surface) 87%, var(--info))',
    ];
    // ACT
    const colours = SKY_TONES.map((tone) => skyColour(tone));
    // ASSERT
    expect(colours).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a sky of no height', () => {
    // ARRANGE
    const expected = /positive/;
    // ACT
    const cut = () => skyFacets({ left: 0, width: 1200, height: 0, seed: 3 });
    // ASSERT
    expect(cut).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('runs its top band on above the drawing when it rises, so the top edge keeps the top two tones', () => {
    // ARRANGE
    const expected = { highest: -600, atTop: ['sky-1', 'sky-2'] };
    // ACT
    const facets = skyFacets({ left: 0, width: 1200, height: 400, rise: 600, seed: 3 });
    const corners = facets.flatMap(({ points, tone }) =>
      points.split(' ').map((pair) => ({ y: Number(pair.split(',')[1]), tone })),
    );
    const seen = {
      highest: Math.min(...corners.map(({ y }) => y)),
      atTop: [...new Set(corners.filter(({ y }) => y <= 0).map(({ tone }) => tone))].sort(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('meets the waterline and the top edge straight, so the sky has no gap above or below', () => {
    // ARRANGE
    const sky = { left: -1200, width: 3600, height: 425, seed: 5 };
    const expected = { top: [0], bottom: [425] };
    // ACT
    const ys = skyFacets(sky).flatMap(({ points }) => points.split(' ').map((pair) => Number(pair.split(',')[1])));
    const seen = { top: [...new Set(ys.filter((y) => y <= 0))], bottom: [...new Set(ys.filter((y) => y >= 425))] };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
