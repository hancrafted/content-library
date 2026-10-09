import { describe, expect, it } from 'vitest';
import { paperOverflow } from './paper-overflow.pure';

describe('paper overflow', () => {
  describe('success cases', () => {
    it('varies the wait and drift from an explicit random sample', () => {
      // ARRANGE
      const expected = { delay: 2.5, drift: 0, duration: 4.5 };
      // ACT
      const flight = paperOverflow(0.5);
      // ASSERT
      expect(flight).toEqual(expected);
    });
  });
  describe('failure cases', () => {
    it.each([-0.1, 1.1, Number.NaN])('rejects invalid random sample %s', (sample) => {
      // ARRANGE
      const expected = RangeError;
      // ACT
      const flight = () => paperOverflow(sample);
      // ASSERT
      expect(flight).toThrow(expected);
    });
  });
  describe('edge cases', () => {
    it('keeps waits between one and four seconds and allows either drift direction', () => {
      // ARRANGE
      const earliest = { delay: 1, drift: -240, duration: 4 };
      const latest = { delay: 4, drift: 240, duration: 5 };
      // ACT
      const low = paperOverflow(0);
      const high = paperOverflow(1);
      // ASSERT
      expect(low).toEqual(earliest);
      expect(high).toEqual(latest);
    });
  });
});
