import { describe, expect, it } from 'vitest';
import { bandFacets, edgeY, seaFacets, WATER_CELL, zoneEdge } from './zone-edges.pure';

const cornersOf = (facets: readonly { readonly points: string }[]) =>
  new Set(facets.flatMap(({ points }) => points.split(' ')));

describe('success cases', () => {
  it('runs a zone boundary in uneven waves across its span, never further from its line than the amplitude', () => {
    // ARRANGE
    const line = { left: 0, right: 1200, y: 300, amplitude: 14, seed: 4 };
    const expected = { from: 0, to: 1200, within: true, heights: 'uneven' };
    // ACT
    const edge = zoneEdge(line);
    const offsets = edge.map(([, y]) => Math.round(y - line.y));
    const seen = {
      from: edge[0]?.[0],
      to: edge.at(-1)?.[0],
      within: offsets.every((offset) => Math.abs(offset) <= line.amplitude),
      heights: new Set(offsets).size > edge.length / 2 ? 'uneven' : 'even',
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('lets two bands meet on the very corners of the boundary between them, so no seam opens', () => {
    // ARRANGE
    const top = zoneEdge({ left: 0, right: 1200, y: 0, amplitude: 0, seed: 1 });
    const between = zoneEdge({ left: 0, right: 1200, y: 240, amplitude: 14, seed: 9 });
    const bottom = zoneEdge({ left: 0, right: 1200, y: 480, amplitude: 14, seed: 13 });
    const expected = between.map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
    // ACT
    const above = cornersOf(bandFacets({ left: 0, width: 1200, top, bottom: between, cell: WATER_CELL, seed: 5 }));
    const below = cornersOf(bandFacets({ left: 0, width: 1200, top: between, bottom, cell: WATER_CELL, seed: 11 }));
    const shared = expected.filter((corner) => above.has(corner) && below.has(corner));
    // ASSERT
    expect(shared).toEqual(expected);
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
  it('refuses a zone boundary that does not run left to right', () => {
    // ARRANGE
    const expected = /left of its right end/;
    // ACT
    const draw = () => zoneEdge({ left: 400, right: 400, y: 0, amplitude: 10, seed: 1 });
    // ASSERT
    expect(draw).toThrow(expected);
  });
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
  it('keeps a boundary of no amplitude straight, and reads its height between and beyond its points', () => {
    // ARRANGE
    const expected = {
      edge: [
        [0, 50],
        [1200, 50],
      ],
      heights: [50, 50, 50],
    };
    const sloped = [
      [0, 0],
      [100, 100],
    ] as const;
    const expectedSloped = [0, 25, 100];
    // ACT
    const edge = zoneEdge({ left: 0, right: 1200, y: 50, amplitude: 0, seed: 3 });
    const heights = [-10, 600, 1300].map((x) => edgeY(edge, x));
    const slopedHeights = [-5, 25, 150].map((x) => edgeY(sloped, x));
    // ASSERT
    expect({ edge, heights }).toEqual(expected);
    expect(slopedHeights).toEqual(expectedSloped);
  });
  it('cuts the same water for seed 7 every time: the corners fixed, the inner ones nudged, the top and bottom along', () => {
    // ARRANGE
    const expected = [
      { points: '0,0 70.7,0 0,100', tone: 'sea-lit' },
      { points: '70.7,0 73.7,128.6 0,100', tone: 'sea' },
      { points: '70.7,0 200,0 73.7,128.6', tone: 'sea-lit' },
      { points: '200,0 200,100 73.7,128.6', tone: 'sea' },
      { points: '0,100 73.7,128.6 0,200', tone: 'sea-lit' },
      { points: '73.7,128.6 111.9,200 0,200', tone: 'sea' },
      { points: '73.7,128.6 200,100 111.9,200', tone: 'sea-lit' },
      { points: '200,100 200,200 111.9,200', tone: 'sea' },
    ];
    // ACT
    const facets = seaFacets({ width: 200, height: 200, cell: 100, seed: 7 });
    // ASSERT
    expect(facets).toEqual(expected);
  });
});
