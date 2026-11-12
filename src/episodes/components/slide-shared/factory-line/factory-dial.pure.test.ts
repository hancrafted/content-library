import { describe, expect, it } from 'vitest';
import { dialGeometry } from './factory-dial.pure';

/*
 * A factory dial: a half-circle gauge on a 64 by 42 face, its arc and needle turned from the left end (0) to the right
 * end (1). The worked values are the approved Spec's mock of Slide 1, where the efficiency dial is cranked to 0.88.
 */

describe('success cases', () => {
  it('ends the arc and the needle where the mock draws the efficiency dial cranked to 0.88', () => {
    // ARRANGE
    const expected = { arc: 'M8 36A24 24 0 0 1 54.3 27.2', needle: { x: 48.7, y: 29.4 } };
    // ACT
    const actual = dialGeometry(0.88);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('points the needle straight up at half', () => {
    // ARRANGE
    const expected = { x: 32, y: 18 };
    // ACT
    const actual = dialGeometry(0.5).needle;
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rests a negative value at the dial’s left end, never turning it backwards', () => {
    // ARRANGE
    const expected = dialGeometry(0);
    // ACT
    const actual = dialGeometry(-0.3);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('clamps a value past the dial to its right end', () => {
    // ARRANGE
    const expected = dialGeometry(1);
    // ACT
    const actual = dialGeometry(1.4);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
