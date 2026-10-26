import { describe, expect, it } from 'vitest';
import { dateLabelOf } from './date-label.pure';

describe('success cases', () => {
  it('writes a day the way an English reader writes it', () => {
    // ARRANGE
    const expected = 'Oct 23, 2026';
    // ACT
    const label = dateLabelOf('2026-10-23', 'en');
    // ASSERT
    expect(label).toBe(expected);
  });

  it('writes a day the way a German reader writes it', () => {
    // ARRANGE
    const expected = '23. Okt. 2026';
    // ACT
    const label = dateLabelOf('2026-10-23', 'de');
    // ASSERT
    expect(label).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses a day that is not a calendar date, so the build fails rather than ships a blank', () => {
    // ARRANGE
    const notADay = '2026-13-40';
    // ACT
    const label = () => dateLabelOf(notADay, 'en');
    // ASSERT
    expect(label).toThrow(RangeError);
  });
});

describe('edge cases', () => {
  it('keeps the first day of a year on its own day, whatever the build machine’s time zone', () => {
    // ARRANGE
    const expected = 'Jan 1, 2027';
    // ACT
    const label = dateLabelOf('2027-01-01', 'en');
    // ASSERT
    expect(label).toBe(expected);
  });
});
