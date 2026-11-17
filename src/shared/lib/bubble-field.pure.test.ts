import { describe, expect, it } from 'vitest';
import { bubbleField } from './bubble-field.pure';

describe('success cases', () => {
  it('lays out the same separate bubbles every time, spread across the width', () => {
    // ARRANGE
    const count = 14;
    const expected = { count, distinctLefts: count, outside: [], again: [] };
    // ACT
    const field = bubbleField(count);
    const again = bubbleField(count);
    const seen = {
      count: field.length,
      distinctLefts: new Set(field.map(({ x }) => x.toFixed(1))).size,
      outside: field.filter(({ x }) => x < 2 || x > 98),
      again: again.filter((bubble, at) => JSON.stringify(bubble) !== JSON.stringify(field[at])),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lets every bubble rise from below the bottom past the top as progress runs from 0 to 1', () => {
    // ARRANGE
    const exit = 1.2;
    const expected = { notBelowAtStart: [], shortOfTheTopAtEnd: [] };
    // ACT
    const field = bubbleField(20);
    const seen = {
      notBelowAtStart: field.filter(({ start }) => start < 0 || start >= 1),
      shortOfTheTopAtEnd: field.filter(({ start, rise }) => (1 - start) * rise < exit),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a field of no bubbles, or of part of one', () => {
    // ARRANGE
    const expected = /whole number of bubbles/;
    // ACT
    const attempts = [0, -3, 2.5].map((count) => () => bubbleField(count));
    // ASSERT
    attempts.forEach((attempt) => expect(attempt).toThrow(expected));
  });
});

describe('edge cases', () => {
  it('draws bubbles of several sizes between a small and a large one, never a single size', () => {
    // ARRANGE
    const expected = { kinds: [10, 12, 14, 16, 18, 22, 24, 28, 34, 40, 44] };
    // ACT
    const sizes = bubbleField(14).map(({ size }) => size);
    const seen = { kinds: [...new Set(sizes)].sort((a, b) => a - b) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('writes every number short, so forty bubbles on every edge stay light in the page', () => {
    // ARRANGE
    const decimals = { x: 1, start: 3, rise: 3, phase: 2 };
    const expected = { long: [] };
    // ACT
    const field = bubbleField(40);
    const digits = (value: number) => (String(value).split('.')[1] ?? '').length;
    const seen = {
      long: field.filter(
        ({ x, start, rise, phase }) =>
          digits(x) > decimals.x ||
          digits(start) > decimals.start ||
          digits(rise) > decimals.rise ||
          digits(phase) > decimals.phase,
      ),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
