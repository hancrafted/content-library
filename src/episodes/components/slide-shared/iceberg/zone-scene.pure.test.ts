import { describe, expect, it } from 'vitest';
import { depthBands, seaFacets, WATER_CELL, zoneSceneParts } from './zone-scene.pure';

/*
 * What `ZoneScene` draws for a zone: the one prop a Slide names decides the sky, the rays, the seabed, the iceberg's
 * part and the zone's one ambient loop; and the faceted water it all sits in, the same on every render.
 */

describe('success cases', () => {
  it('draws each zone with its own scenery and its one ambient loop, from the Surface down', () => {
    // ARRANGE
    const expected = [
      { sky: true, rays: false, seabed: false, iceberg: 'whole', life: 'wind', water: 'sunlit', titleLife: [] },
      { sky: false, rays: true, seabed: false, iceberg: 'keel', life: 'fish', water: 'sunlit', titleLife: [] },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'jellies', water: 'twilight', titleLife: [] },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'whale', water: 'midnight', titleLife: [] },
      { sky: false, rays: false, seabed: true, iceberg: 'none', life: 'bubbles', water: 'abyss', titleLife: [] },
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
  it('floats the Surface in the sky above the ship, then stacks the four zones from the waterline to the seabed', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', top: 190, bottom: 290 },
      { zone: 'sunlit', top: 460, bottom: 560 },
      { zone: 'twilight', top: 560, bottom: 660 },
      { zone: 'midnight', top: 660, bottom: 760 },
      { zone: 'abyss', top: 760, bottom: 880 },
    ];
    // ACT
    const bands = depthBands();
    // ASSERT
    expect(bands).toEqual(expected);
  });

  it('adds a lanternfish school and a siphonophore to a Twilight Section title, beside its drifting jellies', () => {
    // ARRANGE
    const expected = { life: 'jellies', titleLife: ['lanternfish', 'siphonophore'] };
    // ACT
    const { life, titleLife } = zoneSceneParts({ zone: 'twilight', sectionTitle: true });
    // ASSERT
    expect({ life, titleLife }).toEqual(expected);
  });

  it('cuts the deep water into about half the facets it had: 30 triangles over a 1200 by 800 Scene', () => {
    // ARRANGE
    const expected = 30;
    // ACT
    const facets = seaFacets({ width: 1200, height: 800, cell: WATER_CELL, seed: 23 });
    // ASSERT
    expect(facets).toHaveLength(expected);
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
  it('keeps every other zone the same on its Section title: the title life is the Twilight zone only', () => {
    // ARRANGE
    const zones = ['surface', 'sunlit', 'midnight', 'abyss'] as const;
    // ACT
    const titleLife = zones.flatMap((zone) => zoneSceneParts({ zone, sectionTitle: true }).titleLife);
    // ASSERT
    expect(titleLife).toEqual([]);
  });

  it('lets a Slide show another part of the iceberg, and keeps the zone loop with it', () => {
    // ARRANGE
    const expected = {
      sky: false,
      rays: true,
      seabed: false,
      iceberg: 'tip',
      life: 'fish',
      water: 'sunlit',
      titleLife: [],
    };
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
