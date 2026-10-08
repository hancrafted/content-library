import { describe, expect, it } from 'vitest';
import { advancePaperPile } from './paper-pile.pure';

describe('paper pile', () => {
  describe('success cases', () => {
    it('rebuilds the workload when the reader leaves a promise', () => {
      // ARRANGE
      const empty = 0;
      const elapsedSeconds = 2;
      const expectedPapers = 20;
      // ACT
      const papers = advancePaperPile(empty, elapsedSeconds, false);
      // ASSERT
      expect(papers).toBe(expectedPapers);
    });
    it('empties a large stack rapidly and starts growing again on leave', () => {
      // ARRANGE
      const stackedPapers = 60;
      const expectedEmpty = 0;
      const expectedRebuilt = 5;
      // ACT
      const emptied = advancePaperPile(stackedPapers, 1, true);
      const rebuilt = advancePaperPile(emptied, 0.5, false);
      // ASSERT
      expect(emptied).toBe(expectedEmpty);
      expect(rebuilt).toBe(expectedRebuilt);
    });
  });
  describe('failure cases', () => {
    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid elapsed time %s', (elapsed) => {
      // ARRANGE
      const expected = 'Paper count and elapsed time must be finite and non-negative.';
      // ACT
      const advance = () => advancePaperPile(10, elapsed, false);
      // ASSERT
      expect(advance).toThrow(expected);
    });
  });
  describe('edge cases', () => {
    it('bounds the drawn pile after it extends beyond the scene', () => {
      // ARRANGE
      const expectedVisibleCapacity = 96;
      // ACT
      const papers = advancePaperPile(90, 60, false);
      // ASSERT
      expect(papers).toBe(expectedVisibleCapacity);
    });
    it('does not depend on the frame rate', () => {
      // ARRANGE
      const expected = 5;
      // ACT
      const oneFrame = advancePaperPile(0, 0.5, false);
      const twoFrames = advancePaperPile(advancePaperPile(0, 0.25, false), 0.25, false);
      // ASSERT
      expect(oneFrame).toBe(expected);
      expect(twoFrames).toBe(expected);
    });
  });
});
