import { describe, expect, it } from 'vitest';
import { promotionFlight } from './promotion-flight.pure';

describe('success cases', () => {
  it('starts a caption word at the envelope center across the diagonal', () => {
    // ARRANGE
    const envelope = { left: 900, top: 180, width: 200, height: 120 };
    const word = { left: 180, top: 420, width: 80, height: 30 };
    const expected = { x: 780, y: -195 };
    // ACT
    const offset = promotionFlight(envelope, word);
    // ASSERT
    expect(offset).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects invalid geometry rather than sending a word off the page', () => {
    // ARRANGE
    const envelope = { left: Number.NaN, top: 180, width: 200, height: 120 };
    const word = { left: 180, top: 420, width: 80, height: 30 };
    const expected = 'Word flight needs finite coordinates and non-negative dimensions.';
    // ACT
    const flight = () => promotionFlight(envelope, word);
    // ASSERT
    expect(flight).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('does not move a word whose center is already at the envelope center', () => {
    // ARRANGE
    const envelope = { left: 100, top: 100, width: 200, height: 100 };
    const word = { left: 160, top: 140, width: 80, height: 20 };
    const expected = { x: 0, y: 0 };
    // ACT
    const offset = promotionFlight(envelope, word);
    // ASSERT
    expect(offset).toEqual(expected);
  });
});
