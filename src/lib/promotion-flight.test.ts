import { describe, expect, it } from 'vitest';
import { promotionArc, promotionFlight } from './promotion-flight.pure';

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
  it('bows the apex beside the straight line and lifts it', () => {
    // ARRANGE
    const offset = { x: 300, y: 0 };
    const expected = { apex: { x: 150, y: 140 - 100 }, spin: 0, duration: 1.1 };
    // ACT
    const arc = promotionArc(offset, () => 0.5);
    // ASSERT
    expect(arc).toEqual(expected);
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
  it('rejects a non-finite launch offset', () => {
    // ARRANGE
    const expected = RangeError;
    // ACT
    const arc = () => promotionArc({ x: Number.NaN, y: 0 }, () => 0.5);
    // ASSERT
    expect(arc).toThrow(expected);
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
  it('bows to either side depending on the roll and survives a zero offset', () => {
    // ARRANGE
    const offset = { x: 0, y: 200 };
    // ACT
    const left = promotionArc(offset, () => 0);
    const right = promotionArc(offset, () => 1);
    const still = promotionArc({ x: 0, y: 0 }, () => 0.5);
    // ASSERT
    expect(left.apex.x).toBeGreaterThan(0);
    expect(right.apex.x).toBeLessThan(0);
    expect(still.apex).toEqual({ x: 0, y: -100 });
  });
});
