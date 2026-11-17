import { describe, expect, it } from 'vitest';
import { COMMENT } from './feedback.pure.ts';

describe('COMMENT', () => {
  describe('success cases', () => {
    it('shows any trimming, escaping or re-encoding: several lines, indentation, quotes, markup, a code fence and non-ASCII text', () => {
      // ARRANGE
      const lines = COMMENT.split('\n');
      // ACT
      const traps = {
        severalLines: lines.length > 1,
        indentation: lines.some((line) => line.startsWith('  ')),
        quotes: COMMENT.includes('"') && COMMENT.includes("'"),
        markup: COMMENT.includes('<b>markup</b>'),
        codeFence: lines.includes('```'),
        nonAscii: [...COMMENT].some((character) => character.charCodeAt(0) > 127),
      };
      // ASSERT
      expect(Object.values(traps)).not.toContain(false);
    });
  });

  describe('edge cases', () => {
    it('breaks lines with \\n only, because a textarea normalizes every other break to \\n', () => {
      // ARRANGE
      // ACT
      const otherBreaks = [13, 8232, 8233].some((code) => COMMENT.includes(String.fromCharCode(code)));
      // ASSERT
      expect(otherBreaks).toBe(false);
    });
  });
});
