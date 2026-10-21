import { describe, expect, it } from 'vitest';
import { deltaText, percentText, richParts, shortTokens } from './context-format.pure';

describe('success cases', () => {
  it('prints token counts in the locale’s decimal mark', () => {
    // ARRANGE
    const expected = { en: '16.3k', de: '16,3k', million: '1M' };
    // ACT
    const printed = { en: shortTokens(16300, 'en'), de: shortTokens(16300, 'de'), million: shortTokens(1e6, 'en') };
    // ASSERT
    expect(printed).toEqual(expected);
  });

  it('splits a story text into plain runs, code and bold', () => {
    // ARRANGE
    const expected = [
      { kind: 'text', text: 'Recalled ' },
      { kind: 'bold', text: 'CLAUDE.md' },
      { kind: 'text', text: ' via ' },
      { kind: 'code', text: 'Read' },
    ];
    // ACT
    const parts = richParts('Recalled **CLAUDE.md** via `Read`');
    // ASSERT
    expect(parts).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('leaves an unclosed backtick as plain text', () => {
    // ARRANGE
    const expected = [{ kind: 'text', text: 'a `b' }];
    // ACT
    const parts = richParts('a `b');
    // ASSERT
    expect(parts).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('prints a percent below 1 with one decimal, and a shrinking step with a minus sign', () => {
    // ARRANGE
    const expected = { percent: '0.4', delta: '−84,000' };
    // ACT
    const printed = { percent: percentText(0.42, 'en'), delta: deltaText(-84000, 'en') };
    // ASSERT
    expect(printed).toEqual(expected);
  });
});
