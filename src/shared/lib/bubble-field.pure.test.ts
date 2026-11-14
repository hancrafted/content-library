import { describe, expect, it } from 'vitest';
import { bubbleField } from './bubble-field.pure';

/*
 * The `bubbles` transition's field of air bubbles: round, separate bubbles that rise through the outgoing Slide's
 * trailing edge as the edge's progress runs from 0 to 1. Each bubble enters below the host's bottom once progress
 * passes its start and has left through the top by full progress, so none stands still at either end.
 */

describe('success cases', () => {
  it('lays out the same separate bubbles every time, spread across the width', () => {
    // ARRANGE
    const count = 14;
    const expected = { count, distinctLefts: count, inside: true };
    // ACT
    const field = bubbleField(count);
    const again = bubbleField(count);
    const seen = {
      count: field.length,
      distinctLefts: new Set(field.map(({ x }) => x.toFixed(1))).size,
      inside: field.every(({ x }) => x >= 2 && x <= 98),
    };
    // ASSERT
    expect(seen).toEqual(expected);
    expect(again).toEqual(field);
  });

  it('lets every bubble rise from below the bottom past the top as progress runs from 0 to 1', () => {
    // ARRANGE
    const expected = { belowAtStart: true, pastTopAtEnd: true };
    // ACT
    const field = bubbleField(20);
    const seen = {
      belowAtStart: field.every(({ start }) => start >= 0 && start < 1),
      pastTopAtEnd: field.every(({ start, rise }) => (1 - start) * rise >= 1.2),
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
    const smallest = 10;
    const largest = 44;
    const kinds = 4;
    // ACT
    const sizes = bubbleField(14).map(({ size }) => size);
    // ASSERT
    expect(new Set(sizes).size).toBeGreaterThanOrEqual(kinds);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(smallest);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(largest);
  });
});
