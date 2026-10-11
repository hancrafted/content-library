import { describe, expect, it } from 'vitest';
import { calcSessionCost, tokenizeText } from './tokenizer.pure';

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
});

describe('failure cases', () => {
  it('never merges punctuation into the word before it', () => {
    // ARRANGE
    const text = 'cost?';
    const expectedTokens = ['cost', '?'];
    // ACT
    const tokens = tokenizeText(text);
    // ASSERT
    expect(tokens).toEqual(expectedTokens);
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
