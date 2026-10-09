import { describe, expect, it } from 'vitest';
import {
  calcSessionCost,
  evaluateContextGauge,
  evaluateThreshold,
  MODEL_PRICINGS,
  tokenizeText,
} from './token-economy-data.pure';

describe('success cases', () => {
  it('splits a sentence into more than its word count of tokens once long words are chunked', () => {
    // ARRANGE
    const sampleText = 'Insanity is doing the same thing over and over again';
    const minExpectedTokens = 5;
    // ACT
    const tokens = tokenizeText(sampleText);
    // ASSERT
    expect(tokens.length).toBeGreaterThan(minExpectedTokens);
  });

  it('prices a session in proportion to its tokens, turns and rate', () => {
    // ARRANGE
    const tokenCount = 1000;
    const turns = 50;
    const ratePerMillion = 5;
    const expectedCost = 0.25;
    // ACT
    const cost = calcSessionCost(tokenCount, turns, ratePerMillion);
    // ASSERT
    expect(cost).toBeCloseTo(expectedCost);
  });

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

  it('puts the context gauge in the safe, warning and danger zone as it fills', () => {
    // ARRANGE
    const expectedZones = ['safe', 'warning', 'danger'];
    // ACT
    const zones = [30, 65, 85].map((percent) => evaluateContextGauge(percent).zone);
    // ASSERT
    expect(zones).toEqual(expectedZones);
  });

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
  it('hands the premium verdict to a threshold above the cheap model’s ceiling', () => {
    // ARRANGE
    const aboveCeiling = 96;
    const expectedWinner = 'premium';
    // ACT
    const verdict = evaluateThreshold(aboveCeiling);
    // ASSERT
    expect(verdict.winner).toBe(expectedWinner);
  });

  it('puts a nearly full context in the danger zone', () => {
    // ARRANGE
    const nearlyFull = 99;
    const expectedZone = 'danger';
    // ACT
    const gauge = evaluateContextGauge(nearlyFull);
    // ASSERT
    expect(gauge.zone).toBe(expectedZone);
  });
});

describe('edge cases', () => {
  it('yields no tokens and no cost for blank text', () => {
    // ARRANGE
    const blankText = '   ';
    // ACT
    const tokens = tokenizeText(blankText);
    const cost = calcSessionCost(0, 50, 5);
    // ASSERT
    expect(tokens).toEqual([]);
    expect(cost).toBe(0);
  });

  it('keeps each zone boundary in the lower zone: 50% safe, 75% warning', () => {
    // ARRANGE
    const expectedZones = ['safe', 'warning'];
    // ACT
    const zones = [50, 75].map((percent) => evaluateContextGauge(percent).zone);
    // ASSERT
    expect(zones).toEqual(expectedZones);
  });

  it('keeps the cheap model the winner right at the 95% threshold', () => {
    // ARRANGE
    const boundary = 95;
    const expectedWinner = 'cheap';
    // ACT
    const verdict = evaluateThreshold(boundary);
    // ASSERT
    expect(verdict.winner).toBe(expectedWinner);
  });

  it('splits a word longer than four characters into chunks of at most four', () => {
    // ARRANGE
    const word = 'tokenization';
    const expectedChunks = ['toke', 'niza', 'tion'];
    // ACT
    const tokens = tokenizeText(word);
    // ASSERT
    expect(tokens).toEqual(expectedChunks);
  });
});
