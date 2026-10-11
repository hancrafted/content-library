import { describe, expect, it } from 'vitest';
import { MODEL_PRICINGS } from './model-pricing.pure';

describe('success cases', () => {
  it('lists three model pricing tiers', () => {
    // ARRANGE
    const expectedTiers = 3;
    // ACT
    const tiers = MODEL_PRICINGS.length;
    // ASSERT
    expect(tiers).toBe(expectedTiers);
  });
});

describe('failure cases', () => {
  it('prices no tier at zero, so every fix shows a cost', () => {
    // ARRANGE
    const expectedFree: string[] = [];
    // ACT
    const free = MODEL_PRICINGS.filter((tier) => tier.costPerFix <= 0).map((tier) => tier.name);
    // ASSERT
    expect(free).toEqual(expectedFree);
  });
});

describe('edge cases', () => {
  it('keeps the dearest tier about 14 times the cheapest per fix, as the 14x-spread note says', () => {
    // ARRANGE
    const expectedSpread = 14;
    const costs = MODEL_PRICINGS.map((tier) => tier.costPerFix);
    // ACT
    const spread = Math.max(...costs) / Math.min(...costs);
    // ASSERT
    expect(Math.round(spread)).toBe(expectedSpread);
  });
});
