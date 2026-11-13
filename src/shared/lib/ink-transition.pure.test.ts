import { describe, expect, it } from 'vitest';
import { INK_PROFILES, inkScale } from './ink-transition.pure';

/*
 * The ink's progress curve per named effect: a quick jump to the profile's knee in the first 2% of progress, so the
 * edge shows at once, then a straight run to full. The `bubbles` profile carries the Iceberg style's Section-title
 * descent.
 */

describe('success cases', () => {
  it('names a bubbles profile beside the others, with its own filter overscan and knee', () => {
    // ARRANGE
    const expected = { bleed: 220, knee: 0.12 };
    // ACT
    const bubbles = INK_PROFILES.bubbles;
    // ASSERT
    expect(bubbles).toEqual(expected);
  });

  it('reaches the bubbles knee at 2% progress and full ink at the end', () => {
    // ARRANGE
    const expected = [0.12, 1];
    // ACT
    const seen = [0.02, 1].map((progress) => inkScale('bubbles', progress));
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no ink before the edge has moved at all', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const scale = inkScale('bubbles', 0);
    // ASSERT
    expect(scale).toBe(expected);
  });
});

describe('edge cases', () => {
  it('runs halfway up to the knee in the first percent of progress', () => {
    // ARRANGE
    const expected = 0.06;
    const digits = 10;
    // ACT
    const scale = inkScale('bubbles', 0.01);
    // ASSERT
    expect(scale).toBeCloseTo(expected, digits);
  });
});
