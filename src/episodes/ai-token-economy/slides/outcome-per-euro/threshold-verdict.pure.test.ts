import { describe, expect, it } from 'vitest';
import { evaluateThreshold } from './threshold-verdict.pure';

describe('success cases', () => {
  it('names the cheap model the winner at a 93% threshold and the premium model at 98%', () => {
    // ARRANGE
    const cheapThreshold = 93;
    const premiumThreshold = 98;
    const expectedCheapWinner = 'cheap';
    const expectedPremiumWinner = 'premium';
    // ACT
    const cheap = evaluateThreshold(cheapThreshold);
    const premium = evaluateThreshold(premiumThreshold);
    // ASSERT
    expect(cheap.winner).toBe(expectedCheapWinner);
    expect(premium.winner).toBe(expectedPremiumWinner);
  });
});

describe('failure cases', () => {
  it('hands the premium verdict to a threshold above the cheap model’s ceiling', () => {
    // ARRANGE
    const aboveCeiling = 96;
    const expectedWinner = 'premium';
    // ACT
    const verdict = evaluateThreshold(aboveCeiling);
    // ASSERT
    expect(verdict.winner).toBe(expectedWinner);
  });
});

describe('edge cases', () => {
  it('keeps the cheap model the winner right at the 95% threshold', () => {
    // ARRANGE
    const boundary = 95;
    const expectedWinner = 'cheap';
    // ACT
    const verdict = evaluateThreshold(boundary);
    // ASSERT
    expect(verdict.winner).toBe(expectedWinner);
  });
});
