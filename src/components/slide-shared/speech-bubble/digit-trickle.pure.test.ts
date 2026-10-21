import { describe, expect, it } from 'vitest';
import { trickleDigits } from './digit-trickle.pure';

describe('success cases', () => {
  it('gives only 0 and 1, as many as asked', () => {
    // ARRANGE
    const count = 9;
    // ACT
    const digits = trickleDigits(count);
    // ASSERT
    expect(digits).toHaveLength(count);
    expect(digits.every((d) => d.char === '0' || d.char === '1')).toBe(true);
    expect(digits.some((d) => d.char === '0') && digits.some((d) => d.char === '1')).toBe(true);
  });

  it('starts each digit later than the one before and keeps the same first digits for a longer trickle', () => {
    // ARRANGE
    const shortCount = 4;
    const longCount = 8;
    const short = trickleDigits(shortCount);
    // ACT
    const long = trickleDigits(longCount);
    // ASSERT
    expect(long.slice(0, shortCount)).toEqual(short);
    expect(long.map((d) => d.delay)).toEqual([...long.map((d) => d.delay)].sort((a, b) => a - b));
  });
});

describe('failure cases', () => {
  it('gives nothing for zero or a negative count', () => {
    // ARRANGE
    const counts = [0, -3];
    // ACT
    const lengths = counts.map((c) => trickleDigits(c).length);
    // ASSERT
    expect(lengths).toEqual([0, 0]);
  });
});

describe('edge cases', () => {
  it('caps a huge count at the fixed sequence', () => {
    // ARRANGE
    const huge = 500;
    const cap = trickleDigits(huge).length;
    // ACT
    const again = trickleDigits(huge + 1).length;
    // ASSERT
    expect(again).toBe(cap);
  });
});
