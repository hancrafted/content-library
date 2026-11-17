import { describe, expect, it } from 'vitest';
import {
  HERO_DEPTH,
  HERO_SHIP_TOP,
  heroBleed,
  heroDepthBands,
  heroIceberg,
  heroLift,
  heroSeabed,
  heroTitleBottom,
  heroWater,
} from './hero-depth.pure';
import { KEEL_DEPTH } from './scenery/iceberg-placement.pure';

describe('success cases', () => {
  it('stacks the Surface sky and the four zones under it, each band starting where the one above ends', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', top: 0, bottom: 425 },
      { zone: 'sunlit', top: 425, bottom: 685 },
      { zone: 'twilight', top: 685, bottom: 835 },
      { zone: 'midnight', top: 835, bottom: 985 },
      { zone: 'abyss', top: 985, bottom: 1180 },
    ];
    // ACT
    const bands = heroDepthBands(HERO_DEPTH);
    // ASSERT
    expect(bands).toEqual(expected);
  });

  it('gives the sky about a third of the hero and the water under it the rest (feedback 3, decision 45)', () => {
    // ARRANGE
    const digits = 2;
    const expected = { sky: expect.closeTo(0.36, digits), water: expect.closeTo(0.64, digits) };
    // ACT
    const sky = HERO_DEPTH.waterline / HERO_DEPTH.height;
    // ASSERT
    expect({ sky, water: 1 - sky }).toEqual(expected);
  });

  it("ends the Abyss on the seabed: its ridge inside the Abyss, its foot on the drawing's bottom", () => {
    // ARRANGE
    const abyss = { top: 985, bottom: 1180 };
    const expected = { y: 1100, foot: abyss.bottom };
    // ACT
    const seabed = heroSeabed(HERO_DEPTH);
    // ASSERT
    expect({ y: seabed.y, foot: seabed.y + seabed.height }).toEqual(expected);
    expect(seabed.y).toBeGreaterThan(abyss.top);
  });

  it('waves every boundary under the waterline, and keeps the waterline itself straight (decisions 41, 45)', () => {
    // ARRANGE
    const expected = { waterline: 1, deeper: ['twilight', 'midnight', 'abyss'] };
    // ACT
    const bands = heroWater(HERO_DEPTH);
    const heights = (zone: string) => new Set(bands.find((band) => band.zone === zone)?.top.map(([, y]) => y)).size;
    const wavy = bands.filter(({ zone }) => zone !== 'sunlit' && heights(zone) > 1).map(({ zone }) => zone);
    // ASSERT
    expect({ waterline: heights('sunlit'), deeper: wavy }).toEqual(expected);
  });

  it('ends the iceberg keel a fifth into the Twilight zone, at least twice as deep as its tip stands tall', () => {
    // ARRANGE
    const tip = 168 * 0.75;
    const expected = { keel: 715, deepEnough: 2 * tip };
    // ACT
    const berg = heroIceberg(HERO_DEPTH);
    const keel = berg.waterline + berg.depthScale * berg.scale * KEEL_DEPTH;
    // ASSERT
    expect(keel).toBeCloseTo(expected.keel);
    expect(keel - HERO_DEPTH.waterline).toBeGreaterThanOrEqual(expected.deepEnough);
  });

  it('facets the water under the waterline about half as densely as before feedback 2, across the bleed too', () => {
    // ARRANGE
    const expected = 120;
    // ACT
    const triangles = heroWater(HERO_DEPTH).reduce((sum, band) => sum + band.facets.length, 0);
    // ASSERT
    expect(triangles).toBe(expected);
  });

  it("lifts the drawing on a short window, so the title ends above the ship's masthead at every size checked", () => {
    // ARRANGE
    const windows = [
      { width: 1440, height: 723 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 812 },
      { width: 375, height: 667 },
    ];
    // ACT
    const covered = windows.filter((window) => {
      const lift = heroLift(window);
      const scale = (window.height - lift) / HERO_DEPTH.height;
      const masthead = lift + (HERO_DEPTH.waterline - HERO_SHIP_TOP) * scale;
      return masthead < heroTitleBottom(window);
    });
    // ASSERT
    expect(covered).toEqual([]);
  });
});

describe('failure cases', () => {
  it('refuses zone bands that run past the bottom of the drawing', () => {
    // ARRANGE
    const expected = /run to 1240, past the drawing's 1180/;
    const overfull = { ...HERO_DEPTH, depths: { sunlit: 320, twilight: 150, midnight: 150, abyss: 195 } };
    // ACT
    const build = () => heroDepthBands(overfull);
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('leaves the drawing at the top of a window tall enough for the title above the ship', () => {
    // ARRANGE
    const tall = { width: 1440, height: 2000 };
    // ACT
    const lift = heroLift(tall);
    // ASSERT
    expect(lift).toBe(0);
  });

  it('reads the title as two lines on a wide screen, three on a narrower one and five on a phone', () => {
    // ARRANGE
    const headerBandPixels = 94;
    const slideHeaderTopPaddingPixels = { wide: 96, phone: 64 };
    const heroLeading = 1.05;
    const expected = [
      headerBandPixels + slideHeaderTopPaddingPixels.wide + 2 * heroLeading * 72,
      headerBandPixels + slideHeaderTopPaddingPixels.wide + 3 * heroLeading * 0.052 * 1024,
      headerBandPixels + slideHeaderTopPaddingPixels.phone + 5 * heroLeading * 40,
    ];
    const digits = 5;
    const close = expected.map((bottom) => expect.closeTo(bottom, digits));
    // ACT
    const bottoms = [1440, 1024, 375].map((width) => heroTitleBottom({ width, height: 800 }));
    // ASSERT
    expect(bottoms).toEqual(close);
  });

  it('stretches the Abyss down to the bottom of the drawing when the bands above leave room', () => {
    // ARRANGE
    const expected = { top: 985, bottom: 1180 };
    const short = { ...HERO_DEPTH, depths: { sunlit: 260, twilight: 150, midnight: 150, abyss: 20 } };
    // ACT
    const abyss = heroDepthBands(short).at(-1);
    // ASSERT
    expect({ top: abyss?.top, bottom: abyss?.bottom }).toEqual(expected);
  });

  it('runs the sky and water a whole width past each side, so a screen wider than the drawing sees no edge', () => {
    // ARRANGE
    const expected = { left: -1200, width: 3600 };
    // ACT
    const bleed = heroBleed(HERO_DEPTH);
    // ASSERT
    expect(bleed).toEqual(expected);
  });

  it('facets the water and runs each boundary across the whole bleed, so a wide screen shows no flat column', () => {
    // ARRANGE
    const expected = { spans: [[-1200, 2400]], facetSpan: [-1200, 2400], seams: [true, true, true] };
    // ACT
    const bands = heroWater(HERO_DEPTH);
    const xs = bands.flatMap(({ facets }) =>
      facets.flatMap(({ points }) => points.split(' ').map((pair) => Number(pair.split(',')[0]))),
    );
    const spans = [...new Set(bands.map(({ top }) => JSON.stringify([top[0]?.[0], top.at(-1)?.[0]])))].map((span) =>
      JSON.parse(span),
    );
    const seams = bands.slice(1).map(({ top }, index) => top === bands[index]?.bottom);
    // ASSERT
    expect({ spans, facetSpan: [Math.min(...xs), Math.max(...xs)], seams }).toEqual(expected);
  });
});
