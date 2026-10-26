import { describe, expect, it } from 'vitest';
import { isPastEvent } from './events.pure';

describe('success cases', () => {
  it('A past Event says its content may differ from the recording; an upcoming Event does not', () => {
    // ARRANGE
    const buildDay = '2026-10-26';
    const expected = { past: true, upcoming: false };
    // ACT
    const seen = {
      past: isPastEvent('2026-10-23', buildDay),
      upcoming: isPastEvent('2026-10-28', buildDay),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps an Event built on its own day upcoming', () => {
    // ARRANGE
    const day = '2026-10-28';
    // ACT
    const past = isPastEvent(day, day);
    // ASSERT
    expect(past).toBe(false);
  });
});

describe('edge cases', () => {
  it('reads an Event at the end of a month as past on the first day of the next', () => {
    // ARRANGE
    const date = '2026-09-30';
    // ACT
    const past = isPastEvent(date, '2026-10-01');
    // ASSERT
    expect(past).toBe(true);
  });
});
