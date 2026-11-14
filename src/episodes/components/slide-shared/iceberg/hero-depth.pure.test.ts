import { describe, expect, it } from 'vitest';
import { HERO_DEPTH, heroDepthBands } from './hero-depth.pure';

/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option): a tall sky for the
 * title and lede, the waterline, then the four zones under it in bands that thin with depth, each with the place
 * its label sits on the ruler drawn at the Scene's left.
 */

describe('success cases', () => {
  it('stacks the Surface sky and the four zones under it, each band starting where the one above ends', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', top: 0, bottom: 710, label: 670 },
      { zone: 'sunlit', top: 710, bottom: 810, label: 760 },
      { zone: 'twilight', top: 810, bottom: 885, label: 847.5 },
      { zone: 'midnight', top: 885, bottom: 945, label: 915 },
      { zone: 'abyss', top: 945, bottom: 1000, label: 972.5 },
    ];
    // ACT
    const bands = heroDepthBands(HERO_DEPTH);
    // ASSERT
    expect(bands).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses zone bands that run past the bottom of the drawing', () => {
    // ARRANGE
    const expected = /run to 1060, past the drawing's 1000/;
    const overfull = { ...HERO_DEPTH, depths: { sunlit: 160, twilight: 75, midnight: 60, abyss: 55 } };
    // ACT
    const build = () => heroDepthBands(overfull);
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('stretches the Abyss down to the bottom of the drawing when the bands above leave room', () => {
    // ARRANGE
    const expected = { top: 945, bottom: 1000 };
    const short = { ...HERO_DEPTH, depths: { sunlit: 100, twilight: 75, midnight: 60, abyss: 30 } };
    // ACT
    const abyss = heroDepthBands(short).at(-1);
    // ASSERT
    expect({ top: abyss?.top, bottom: abyss?.bottom }).toEqual(expected);
  });
});
