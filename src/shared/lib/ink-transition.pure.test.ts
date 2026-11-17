import { describe, expect, it } from 'vitest';
import { INK_PROFILES, inkScale, inkTransform } from './ink-transition.pure';

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

  it('raises the bubbles water by translation and scales every other ink', () => {
    // ARRANGE
    const expected = ['translateY(88%)', 'scaleY(0.12)', 'translateY(0%)'];
    // ACT
    const seen = [inkTransform('bubbles', 0.02), inkTransform('wave', 0.02), inkTransform('bubbles', 1)];
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

  it('keeps the bubbles water wholly below the host before the edge has moved', () => {
    // ARRANGE
    const expected = 'translateY(100%)';
    // ACT
    const transform = inkTransform('bubbles', 0);
    // ASSERT
    expect(transform).toBe(expected);
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
