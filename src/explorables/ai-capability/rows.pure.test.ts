import { describe, expect, it } from 'vitest';
import { toggleRow, trackPercent } from './rows.pure';

describe('success cases', () => {
  it('stacks the shown rows in the toolbar order, whichever is switched on first', () => {
    // ARRANGE
    const shown = toggleRow(['mismatch'], 'role');
    const order = ['role', 'ceiling', 'mismatch'];
    // ACT
    const all = toggleRow(shown, 'ceiling');
    // ASSERT
    expect(all).toEqual(order);
  });

  it('takes a shown row out again', () => {
    // ARRANGE
    const shown = ['role', 'ceiling'] as const;
    const left = ['ceiling'];
    // ACT
    const after = toggleRow(shown, 'role');
    // ASSERT
    expect(after).toEqual(left);
  });

  it('places 1× at the start of the ceiling track and the 20× promise near its end, on a log scale', () => {
    // ARRANGE
    const promise = 20;
    // log(20) / log(30), the track running from 1× to 30×
    const promiseAt = 88.08;
    // ACT
    const placed = [trackPercent(1), trackPercent(promise)];
    // ASSERT
    expect(placed[0]).toBe(0);
    expect(placed[1]).toBeCloseTo(promiseAt, 1);
  });
});

describe('failure cases', () => {
  it('puts a multiplier below 1× on the start of the track, never before it', () => {
    // ARRANGE
    const slower = 0.8;
    // ACT
    const placed = trackPercent(slower);
    // ASSERT
    expect(placed).toBe(0);
  });
});

describe('edge cases', () => {
  it('keeps a multiplier past the end of the track on its end', () => {
    // ARRANGE
    const beyond = 100;
    const end = 100;
    // ACT
    const placed = trackPercent(beyond);
    // ASSERT
    expect(placed).toBe(end);
  });
});
