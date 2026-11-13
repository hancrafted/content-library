import { describe, expect, it } from 'vitest';
import { rulerBands, type Zone } from './ruler.pure';

/*
 * The depth ruler's layout: the five zone bands from the Surface down, each holding one tile per Section that sits in
 * it, the one Section lit. A Slide names its Section; the ruler finds its band.
 */

const WATERLINE_SECTIONS: readonly Zone[] = [
  'surface',
  'surface',
  'sunlit',
  'sunlit',
  'twilight',
  'twilight',
  'midnight',
  'abyss',
];

describe('success cases', () => {
  it('puts each Section on its zone band, from the Surface down, the third Section lit', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', tiles: [{ section: 0 }, { section: 1 }] },
      { zone: 'sunlit', tiles: [{ section: 2, lit: true }, { section: 3 }] },
      { zone: 'twilight', tiles: [{ section: 4 }, { section: 5 }] },
      { zone: 'midnight', tiles: [{ section: 6 }] },
      { zone: 'abyss', tiles: [{ section: 7 }] },
    ];
    // ACT
    const bands = rulerBands(WATERLINE_SECTIONS, 2);
    // ASSERT
    expect(bands).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a lit Section the Episode does not have', () => {
    // ARRANGE
    const expected = /Section 8 of 8/;
    // ACT
    const draw = () => rulerBands(WATERLINE_SECTIONS, 8);
    // ASSERT
    expect(draw).toThrow(expected);
  });

  it('refuses Sections that climb back up, since the descent only goes down', () => {
    // ARRANGE
    const expected = /deeper/;
    // ACT
    const draw = () => rulerBands(['sunlit', 'surface'], 0);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps a zone no Section sits in as an empty band, so the depth still reads to the Abyss', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', tiles: [{ section: 0, lit: true }] },
      { zone: 'sunlit', tiles: [] },
      { zone: 'twilight', tiles: [] },
      { zone: 'midnight', tiles: [] },
      { zone: 'abyss', tiles: [{ section: 1 }] },
    ];
    // ACT
    const bands = rulerBands(['surface', 'abyss'], 0);
    // ASSERT
    expect(bands).toEqual(expected);
  });
});
