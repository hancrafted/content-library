import { describe, expect, it } from 'vitest';
import { tryTitle } from './words.pure';

describe('success cases', () => {
  it('fills the stage name into the word', () => {
    // ARRANGE
    const words = { tryTitle: '{stage}: Try it' };
    // ACT
    const title = tryTitle(words, 'Plan');
    // ASSERT
    expect(title).toBe('Plan: Try it');
  });
});

describe('failure cases', () => {
  it('leaves a word without a placeholder as it is', () => {
    // ARRANGE
    const words = { tryTitle: 'Try it' };
    // ACT
    const title = tryTitle(words, 'Plan');
    // ASSERT
    expect(title).toBe('Try it');
  });
});

describe('edge cases', () => {
  it('fills a stage name that itself holds a brace', () => {
    // ARRANGE
    const words = { tryTitle: '{stage}: Try it' };
    // ACT
    const title = tryTitle(words, 'A {b}');
    // ASSERT
    expect(title).toBe('A {b}: Try it');
  });
});
