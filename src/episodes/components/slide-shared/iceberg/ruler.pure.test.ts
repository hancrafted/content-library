import { describe, expect, it } from 'vitest';
import { descentOf, isDarkZone, rulerBands, zoneOf, ZONES, zoneToken, type Zone } from './ruler.pure';

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

  it('colours each zone from its one token and turns text light on the two dark zones only', () => {
    // ARRANGE
    const expected = [
      { token: 'var(--zone-surface)', dark: false },
      { token: 'var(--zone-sunlit)', dark: false },
      { token: 'var(--zone-twilight)', dark: false },
      { token: 'var(--zone-midnight)', dark: true },
      { token: 'var(--zone-abyss)', dark: true },
    ];
    // ACT
    const seen = ZONES.map((zone) => ({ token: zoneToken(zone), dark: isDarkZone(zone) }));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('sends the view further down for a deeper Section: none for the Surface, four bands to the Abyss', () => {
    // ARRANGE
    const expected = [0, 0, 1, 1, 2, 2, 3, 4];
    // ACT
    const seen = WATERLINE_SECTIONS.map((_, section) => descentOf(WATERLINE_SECTIONS, section));
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses the zone of a Section the Episode does not have, or of half a Section', () => {
    // ARRANGE
    const expected = [/No Section -1 of 8/, /No Section 1.5 of 8/];
    // ACT
    const seen = [-1, 1.5].map((section) => () => zoneOf(WATERLINE_SECTIONS, section));
    // ASSERT
    expect(seen[0]).toThrow(expected[0]);
    expect(seen[1]).toThrow(expected[1]);
  });

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
