import { describe, expect, it } from 'vitest';
import { seaFacets, zoneSceneParts } from './zone-scene.pure';

/*
 * What `ZoneScene` draws for a zone: the one prop a Slide names decides the sky, the rays, the seabed, the iceberg's
 * part and the zone's one ambient loop; and the faceted water it all sits in, the same on every render.
 */

describe('success cases', () => {
  it('draws each zone with its own scenery and its one ambient loop, from the Surface down', () => {
    // ARRANGE
    const expected = [
      { sky: true, rays: false, seabed: false, iceberg: 'whole', life: 'wind' },
      { sky: false, rays: true, seabed: false, iceberg: 'keel', life: 'fish' },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'jellies' },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'whale' },
      { sky: false, rays: false, seabed: true, iceberg: 'none', life: 'bubbles' },
    ];
    // ACT
    const parts = (['surface', 'sunlit', 'twilight', 'midnight', 'abyss'] as const).map((zone) =>
      zoneSceneParts({ zone }),
    );
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it('cuts the water into triangles, each lit towards the upper left or not', () => {
    // ARRANGE
    const expected = { count: 4, tones: ['sea', 'sea-lit'] };
    // ACT
    const facets = seaFacets({ width: 200, height: 100, cell: 100, seed: 3 });
    const seen = { count: facets.length, tones: [...new Set(facets.map(({ tone }) => tone))].sort() };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses water cut into cells of no size', () => {
    // ARRANGE
    const expected = /positive/;
    // ACT
    const cut = () => seaFacets({ width: 200, height: 100, cell: 0, seed: 3 });
    // ASSERT
    expect(cut).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('lets a Slide show another part of the iceberg and drop the loop where its Scene wants calm water', () => {
    // ARRANGE
    const expected = { sky: false, rays: true, seabed: false, iceberg: 'tip', life: 'none' };
    // ACT
    const parts = zoneSceneParts({ zone: 'sunlit', iceberg: 'tip', ambient: false });
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it('cuts the same water for the same seed, so a Slide never redraws differently', () => {
    // ARRANGE
    const expected = seaFacets({ width: 300, height: 120, cell: 60, seed: 7 }).map(({ points }) => points);
    // ACT
    const again = seaFacets({ width: 300, height: 120, cell: 60, seed: 7 }).map(({ points }) => points);
    // ASSERT
    expect(again).toEqual(expected);
  });
});
