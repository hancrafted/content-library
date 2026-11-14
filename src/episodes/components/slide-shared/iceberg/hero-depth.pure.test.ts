import { describe, expect, it } from 'vitest';
import { HERO_DEPTH, heroBleed, heroDepthBands, heroIceberg } from './hero-depth.pure';
import { KEEL_DEPTH } from './scenery/iceberg-placement.pure';

/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option): a sky for the title
 * and the sun, then the four zones under it, all fitted to the hero's height so every zone shows at any width; the
 * Sunlit band deep enough for an iceberg keel twice its tip that ends just inside the Twilight zone.
 */

describe('success cases', () => {
  it('stacks the Surface sky and the four zones under it, each band starting where the one above ends', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', top: 0, bottom: 760 },
      { zone: 'sunlit', top: 760, bottom: 990 },
      { zone: 'twilight', top: 990, bottom: 1070 },
      { zone: 'midnight', top: 1070, bottom: 1130 },
      { zone: 'abyss', top: 1130, bottom: 1180 },
    ];
    // ACT
    const bands = heroDepthBands(HERO_DEPTH);
    // ASSERT
    expect(bands).toEqual(expected);
  });

  it('ends the iceberg keel a fifth into the Twilight zone, at least twice as deep as its tip stands tall', () => {
    // ARRANGE
    const tip = 168 * 0.7;
    const expected = { keel: 1006, deepEnough: 2 * tip };
    // ACT
    const berg = heroIceberg(HERO_DEPTH);
    const keel = berg.waterline + berg.depthScale * berg.scale * KEEL_DEPTH;
    // ASSERT
    expect(keel).toBeCloseTo(expected.keel);
    expect(keel - HERO_DEPTH.waterline).toBeGreaterThanOrEqual(expected.deepEnough);
  });
});

describe('failure cases', () => {
  it('refuses zone bands that run past the bottom of the drawing', () => {
    // ARRANGE
    const expected = /run to 1240, past the drawing's 1180/;
    const overfull = { ...HERO_DEPTH, depths: { sunlit: 290, twilight: 80, midnight: 60, abyss: 50 } };
    // ACT
    const build = () => heroDepthBands(overfull);
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('stretches the Abyss down to the bottom of the drawing when the bands above leave room', () => {
    // ARRANGE
    const expected = { top: 1130, bottom: 1180 };
    const short = { ...HERO_DEPTH, depths: { sunlit: 230, twilight: 80, midnight: 60, abyss: 20 } };
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
});
