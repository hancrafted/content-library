import { describe, expect, it } from 'vitest';
import { anchorLanding, anchorOffset } from './anchor-geometry.pure';

describe('success cases', () => {
  it('combines measured pixel margin and root padding without discarding negative lengths', () => {
    // ARRANGE
    const expected = 71.5;
    // ACT
    const offset = anchorOffset({ margin: '-24.5px', padding: '96px', viewport: 800 });
    // ASSERT
    expect(offset).toBe(expected);
  });
});

describe('failure cases', () => {
  it.each(['10junk%', '1e999%', 'Infinity%', 'NaN%', '1.%', '96pxjunk', 'auto', ''])(
    'gives automatic or invalid root padding %s no offset',
    (padding) => {
      // ARRANGE
      const expected = 96;
      // ACT
      const offset = anchorOffset({ margin: '96px', padding, viewport: 800 });
      // ASSERT
      expect(offset).toBe(expected);
    },
  );
  it.each([NaN, Infinity, -Infinity])('ignores non-finite cached offset %s at landing', (offset) => {
    // ARRANGE
    const expected = 1200;
    // ACT
    const landing = anchorLanding({ top: 1200, offset, maximum: 1800 });
    // ASSERT
    expect(landing).toBe(expected);
  });
  it.each(['96pxjunk', 'Infinitypx', '1e999px', 'NaNpx', '20%', '12rem', 'calc(1px + 2px)', '1.px', ''])(
    'gives invalid measured margin %s no offset',
    (margin) => {
      // ARRANGE
      const expected = 32;
      // ACT
      const offset = anchorOffset({ margin, padding: '32px', viewport: 800 });
      // ASSERT
      expect(offset).toBe(expected);
    },
  );
});

describe('edge cases', () => {
  it.each([
    [' +.5px ', ' -24px ', -23.5],
    ['-2.4e1px', ' +1e1% ', 56],
    ['0', '0px', 0],
    ['0px', '0', 0],
    ['0px', '-10%', -80],
  ])('preserves finite measured margin %s and padding %s', (margin, padding, expected) => {
    // ARRANGE
    const measurement = { margin, padding, viewport: 800 };
    // ACT
    const offset = anchorOffset(measurement);
    // ASSERT
    expect(offset).toBe(expected);
  });
  it.each([
    [{ top: 50, offset: 96, maximum: 1800 }, 0],
    [{ top: 2000, offset: 176, maximum: 1800 }, 1800],
    [{ top: 2000, offset: -24, maximum: 3000 }, 2024],
    [{ top: 2000, offset: 1400, maximum: 1800 }, 600],
    [{ top: 50, offset: 0, maximum: 0 }, 0],
  ])('lands measured geometry %j inside the reachable document', (input, expected) => {
    // ARRANGE
    const measurement = input;
    // ACT
    const landing = anchorLanding(measurement);
    // ASSERT
    expect(landing).toBe(expected);
  });
  it('resolves percentage root padding against viewport height', () => {
    // ARRANGE
    const expected = 176;
    // ACT
    const offset = anchorOffset({ margin: '96px', padding: '10%', viewport: 800 });
    // ASSERT
    expect(offset).toBe(expected);
  });
});
