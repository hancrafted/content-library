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
      { sky: true, rays: false, seabed: false, iceberg: 'whole', life: 'wind', water: 'sunlit' },
      { sky: false, rays: true, seabed: false, iceberg: 'keel', life: 'fish', water: 'sunlit' },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'jellies', water: 'twilight' },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'whale', water: 'midnight' },
      { sky: false, rays: false, seabed: true, iceberg: 'none', life: 'bubbles', water: 'abyss' },
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
  it('lets a Slide show another part of the iceberg, and keeps the zone loop with it', () => {
    // ARRANGE
    const expected = { sky: false, rays: true, seabed: false, iceberg: 'tip', life: 'fish', water: 'sunlit' };
    // ACT
    const parts = zoneSceneParts({ zone: 'sunlit', iceberg: 'tip' });
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it('cuts the same water for seed 7 every time: the grid outer corners fixed, its one inner corner nudged', () => {
    // ARRANGE
    // Two by two cells of 100: the only inner corner, at (100, 100), moves by seed 7 to (70.7, 73.7).
    const expected = [
      { points: '0,0 100,0 0,100', tone: 'sea-lit' },
      { points: '100,0 70.7,73.7 0,100', tone: 'sea' },
      { points: '100,0 200,0 70.7,73.7', tone: 'sea-lit' },
      { points: '200,0 200,100 70.7,73.7', tone: 'sea' },
      { points: '0,100 70.7,73.7 0,200', tone: 'sea-lit' },
      { points: '70.7,73.7 100,200 0,200', tone: 'sea' },
      { points: '70.7,73.7 200,100 100,200', tone: 'sea-lit' },
      { points: '200,100 200,200 100,200', tone: 'sea' },
    ];
    // ACT
    const facets = seaFacets({ width: 200, height: 200, cell: 100, seed: 7 });
    // ASSERT
    expect(facets).toEqual(expected);
  });
});
