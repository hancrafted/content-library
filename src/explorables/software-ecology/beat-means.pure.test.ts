import { describe, expect, it } from 'vitest';
import { meanOf, sampleSteps, stepsTo } from './beat-means.pure.ts';

/*
 * A beat's reading (design-ADR 0024 §12, grill 11 Q224): the steps the headless judge and the page's tour both read
 * on, and the mean they both take of them.
 */
const WEEK = stepsTo(1);
const EIGHTH = WEEK / 8;

describe('success cases', () => {
  it('reads a beat eight times a week over its last two weeks, the last on its end', () => {
    // ARRANGE
    const start = 0,
      end = 7 * WEEK,
      samples = 16;
    const expected = { first: end - 2 * WEEK + EIGHTH, last: end, gap: EIGHTH };
    // ACT
    const at = sampleSteps({ start, end });
    // ASSERT
    expect(at).toHaveLength(samples);
    expect({ first: at[0], last: at.at(-1), gap: (at[1] ?? 0) - (at[0] ?? 0) }).toEqual(expected);
  });

  it('takes the mean of each measure over the samples', () => {
    // ARRANGE
    const samples = [
      { 'qa.weeksWaiting': 1, 'customer.sat': 0.5 },
      { 'qa.weeksWaiting': 3, 'customer.sat': 0.7 },
    ];
    const expected = { 'qa.weeksWaiting': 2, 'customer.sat': 0.6 };
    // ACT
    const mean = meanOf(['qa.weeksWaiting', 'customer.sat'], samples);
    // ASSERT
    expect(mean['qa.weeksWaiting']).toBe(expected['qa.weeksWaiting']);
    expect(mean['customer.sat']).toBeCloseTo(expected['customer.sat']);
  });
});

describe('failure cases', () => {
  it('reads nothing for a measure no sample carries, and 0 with no samples', () => {
    // ARRANGE
    const expected = { 'ops.stall': 0 };
    // ACT
    const [missing, none] = [meanOf(['ops.stall'], [{ 'qa.backlog': 4 }]), meanOf(['ops.stall'], [])];
    // ASSERT
    expect(missing).toEqual(expected);
    expect(none).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads a beat shorter than the window over all of it', () => {
    // ARRANGE
    const end = WEEK;
    const expected = { first: EIGHTH, count: 8 };
    // ACT
    const at = sampleSteps({ start: 0, end });
    // ASSERT
    expect({ first: at[0], count: at.length }).toEqual(expected);
  });

  it('reads the end once with a window of 0, as the reference build did', () => {
    // ARRANGE
    const end = 5 * WEEK;
    const expected = [end];
    // ACT
    const at = sampleSteps({ start: 0, end, window: 0 });
    // ASSERT
    expect(at).toEqual(expected);
  });
});
