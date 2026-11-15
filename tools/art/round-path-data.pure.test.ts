import { describe, expect, it } from 'vitest';
import { roundPathData } from './round-path-data.pure.ts';

describe('success cases', () => {
  it('rounds every coordinate inside a quoted path string to an integer', () => {
    // ARRANGE
    const source = `["room", "M641.3 397L482.8 372.5L509.8 219.7Z"]`;
    const expected = `["room", "M641 397L483 373L510 220Z"]`;
    // ACT
    const rounded = roundPathData(source);
    // ASSERT
    expect(rounded).toBe(expected);
  });

  it('rounds a vertex two facets share to the same point, so their seam stays closed', () => {
    // ARRANGE
    const source = `const A = 'M10.4 20.6L30 40Z';\nconst B = 'M30 40L10.4 20.6L0 0Z';`;
    const expected = `const A = 'M10 21L30 40Z';\nconst B = 'M30 40L10 21L0 0Z';`;
    // ACT
    const rounded = roundPathData(source);
    // ASSERT
    expect(rounded).toBe(expected);
  });
});

describe('failure cases', () => {
  it('leaves numbers outside path strings untouched: opacities, scale factors, transforms', () => {
    // ARRANGE
    const source = `<g opacity={0.6} transform="scale(1.2 1.15)"><rect x="12.5" /></g>`;
    // ACT
    const rounded = roundPathData(source);
    // ASSERT
    expect(rounded).toBe(source);
  });
});

describe('edge cases', () => {
  it('keeps two numbers apart where path data packs them without a separator', () => {
    // ARRANGE
    const source = `"M1.5.5L-0.4-2.6Z"`;
    const expected = `"M2 1L0-3Z"`;
    // ACT
    const rounded = roundPathData(source);
    // ASSERT
    expect(rounded).toBe(expected);
  });

  it('rounds to the asked number of decimals, dropping a trailing zero', () => {
    // ARRANGE
    const source = `"M641.34 397.01L482.86 372Z"`;
    const expected = `"M641.3 397L482.9 372Z"`;
    // ACT
    const rounded = roundPathData(source, 1);
    // ASSERT
    expect(rounded).toBe(expected);
  });
});
