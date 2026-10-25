import { describe, expect, it } from 'vitest';
import { isPastEvent } from './events.pure';

describe('success cases', () => {
  it('counts an Event dated before the build day as past', () => {
    // ARRANGE
    const event = { date: '2026-10-23' } as const;
    const buildDay = '2026-10-25';
    // ACT
    const past = isPastEvent(event, buildDay);
    // ASSERT
    expect(past).toBe(true);
  });
});

describe('failure cases', () => {
  it('never counts an Event dated after the build day as past', () => {
    // ARRANGE
    const event = { date: '2026-11-06' } as const;
    const buildDay = '2026-10-25';
    // ACT
    const past = isPastEvent(event, buildDay);
    // ASSERT
    expect(past).toBe(false);
  });
});

describe('edge cases', () => {
  it('keeps an Event built on its own day upcoming, since it may not have happened yet', () => {
    // ARRANGE
    const event = { date: '2026-10-23' } as const;
    const buildDay = '2026-10-23';
    // ACT
    const past = isPastEvent(event, buildDay);
    // ASSERT
    expect(past).toBe(false);
  });

  it('compares across a month and a year boundary', () => {
    // ARRANGE
    const event = { date: '2026-12-31' } as const;
    const buildDay = '2027-01-01';
    // ACT
    const past = isPastEvent(event, buildDay);
    // ASSERT
    expect(past).toBe(true);
  });
});
