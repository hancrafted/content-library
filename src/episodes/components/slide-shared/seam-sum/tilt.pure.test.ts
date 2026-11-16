import { describe, expect, it } from 'vitest';
import { tiltOf } from './tilt.pure';

describe('success cases', () => {
  it('tilts cards alternately, the first to the right', () => {
    // ARRANGE
    const expected = ['rotate-1', '-rotate-1', 'rotate-1', '-rotate-1'];
    // ACT
    const actual = [0, 1, 2, 3].map(tiltOf);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never returns an untilted class, whatever the index', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const actual = [0, 1, 7, 100].every((index) => tiltOf(index).endsWith('rotate-1'));
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('keeps alternating far down a long row', () => {
    // ARRANGE
    const expected = ['rotate-1', '-rotate-1'];
    // ACT
    const actual = [1000, 1001].map(tiltOf);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
