import { describe, expect, it } from 'vitest';
import { middleBand, type Box } from './middle-band.pure';

const rows = (n: number): Box[] => Array.from({ length: n }, (_, i) => ({ top: i * 10, height: 8 }));

describe('success cases', () => {
  it('spans the middle third of the rows when none is marked', () => {
    // ARRANGE
    const expected = { top: 30, height: 28 };
    // ACT
    const actual = middleBand(rows(9), []);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('spans the marked middle rows when the attention list names them', () => {
    // ARRANGE
    const expected = { top: 20, height: 18 };
    // ACT
    const actual = middleBand(rows(9), [rows(9)[2]!, rows(9)[3]!]);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('is none for an empty list', () => {
    // ARRANGE
    const expected = null;
    // ACT
    const actual = middleBand([], []);
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('spans a short list whole', () => {
    // ARRANGE
    const expected = { top: 0, height: 18 };
    // ACT
    const actual = middleBand(rows(2), []);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
