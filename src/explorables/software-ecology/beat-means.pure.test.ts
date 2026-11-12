import { describe, expect, it } from 'vitest';
import { meanOf, sampleSteps, stepSampled, stepsTo, type Sampling } from './beat-means.pure.ts';
import { DTW } from './factory-dials.pure.ts';

/*
 * A beat's reading (design-ADR 0024 §12, grill 11 Q224): the steps the headless judge and the page's tour both read
 * on, and the mean they both take of them.
 */
const WEEK = stepsTo(1);
const EIGHTH = WEEK / 8;

/** A stand-in model: its clock in steps, and one measure that reads the step it stands on. */
const clockModel = () => {
  const m = {
    k: 0,
    step: (weeks: number) => {
      m.k += Math.round(weeks / DTW);
    },
    read: () => ({ measures: { 'x.step': m.k } }),
  };
  return m;
};
const sampling = (at: number[]): Sampling => ({ at, keys: ['x.step'], got: [] });

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

  it('steps a model on, reading on each sample step it passes, and runs the rest unread', () => {
    // ARRANGE
    const m = clockModel(),
      s = sampling([3, 5]),
      n = 9;
    const expected = { k: n, got: [{ 'x.step': 3 }, { 'x.step': 5 }] };
    // ACT
    stepSampled(m, { k: 0, n, s });
    // ASSERT
    expect({ k: m.k, got: s.got }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('steps on without reading when there is no sampling', () => {
    // ARRANGE
    const m = clockModel(),
      n = 4;
    // ACT
    stepSampled(m, { k: 0, n, s: null });
    // ASSERT
    expect(m.k).toBe(n);
  });

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
  it('stops on a sample step past the run and leaves it for the next run', () => {
    // ARRANGE
    const m = clockModel(),
      s = sampling([2, 6]),
      n = 4;
    const expected = { k: n, got: [{ 'x.step': 2 }] };
    // ACT
    stepSampled(m, { k: 0, n, s });
    // ASSERT
    expect({ k: m.k, got: s.got }).toEqual(expected);
  });

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
