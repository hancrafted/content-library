import { describe, expect, it } from 'vitest';
import { HERO_DEPTH, heroDepthBands } from './hero-depth.pure';

/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option): a sky for the title,
 * low enough that a wide screen showing it from the top still reaches the waterline, then the four zones under it in
 * bands that thin with depth.
 */

describe('success cases', () => {
  it('stacks the Surface sky and the four zones under it, each band starting where the one above ends', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', top: 0, bottom: 540 },
      { zone: 'sunlit', top: 540, bottom: 640 },
      { zone: 'twilight', top: 640, bottom: 715 },
      { zone: 'midnight', top: 715, bottom: 775 },
      { zone: 'abyss', top: 775, bottom: 830 },
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
    const expected = /run to 890, past the drawing's 830/;
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
    const expected = { top: 775, bottom: 830 };
    const short = { ...HERO_DEPTH, depths: { sunlit: 100, twilight: 75, midnight: 60, abyss: 30 } };
    // ACT
    const abyss = heroDepthBands(short).at(-1);
    // ASSERT
    expect({ top: abyss?.top, bottom: abyss?.bottom }).toEqual(expected);
  });
});
