import { describe, expect, it } from 'vitest';
import { createSampler, stepsTo } from './beat-means.pure.ts';
import { DTW } from './factory-dials.pure.ts';

/*
 * A beat's reading (design-ADR 0024 §12, grill 11 Q224): the Sampler reads a model on the steps the headless judge
 * and the page's tour both read on, and takes the mean they both take of them.
 */
const WEEK = stepsTo(1);
const EIGHTH = WEEK / 8;
const keys = ['x.step'];

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
/** A stand-in model that reads the next of the given values on each read. */
const scriptedModel = (reads: Record<string, number>[]) => {
  const left = [...reads];
  return { step: () => undefined, read: () => ({ measures: left.shift() ?? {} }) };
};
const stepsRead = (s: { readings: readonly Record<string, number>[] }) => s.readings.map((r) => r['x.step']);

describe('success cases', () => {
  it('reads a beat eight times a week over its last two weeks, the last on its end', () => {
    // ARRANGE
    const end = 7 * WEEK,
      samples = 16;
    const expected = { first: end - 2 * WEEK + EIGHTH, last: end, gap: EIGHTH };
    const s = createSampler({ start: 0, end, keys });
    // ACT
    s.run(clockModel(), { k: 0, n: end });
    // ASSERT
    const at = stepsRead(s) as number[];
    expect(at).toHaveLength(samples);
    expect({ first: at[0], last: at.at(-1), gap: (at[1] ?? 0) - (at[0] ?? 0) }).toEqual(expected);
  });

  it('takes the mean of each measure over the readings', () => {
    // ARRANGE
    const m = scriptedModel([
      { 'qa.weeksWaiting': 1, 'customer.sat': 0.5 },
      { 'qa.weeksWaiting': 3, 'customer.sat': 0.7 },
    ]);
    const end = 2 * EIGHTH,
      count = 2;
    const s = createSampler({ start: 0, end, keys: ['qa.weeksWaiting', 'customer.sat'] });
    const expected = { 'qa.weeksWaiting': 2, 'customer.sat': 0.6 };
    // ACT
    s.run(m, { k: 0, n: end });
    const mean = s.mean();
    // ASSERT
    expect(s.readings).toHaveLength(count);
    expect(mean['qa.weeksWaiting']).toBe(expected['qa.weeksWaiting']);
    expect(mean['customer.sat']).toBeCloseTo(expected['customer.sat']);
  });

  it('steps a model on, reading on each sample step it passes, and runs the rest unread', () => {
    // ARRANGE
    const m = clockModel(),
      n = 3 * WEEK,
      end = 2 * WEEK;
    const s = createSampler({ start: 0, end, window: 0, keys });
    const expected = { k: n, got: [end] };
    // ACT
    s.run(m, { k: 0, n });
    // ASSERT
    expect({ k: m.k, got: stepsRead(s) }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads nothing for a measure no reading carries, and 0 with no readings', () => {
    // ARRANGE
    const expected = { 'ops.stall': 0 };
    const missing = createSampler({ start: 0, end: 1, window: 0, keys: ['ops.stall'] }),
      none = createSampler({ start: 0, end: 1, window: 0, keys: ['ops.stall'] });
    // ACT
    missing.run(scriptedModel([{ 'qa.backlog': 4 }]), { k: 0, n: 1 });
    // ASSERT
    expect(missing.mean()).toEqual(expected);
    expect(none.mean()).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('stops on a sample step past the run and leaves it for the next run', () => {
    // ARRANGE
    const m = clockModel(),
      end = 2 * WEEK;
    const s = createSampler({ start: 0, end, keys });
    const expected = { afterFirst: { k: WEEK, got: 8 }, afterSecond: { k: end, got: 16 } };
    // ACT
    s.run(m, { k: 0, n: WEEK });
    const afterFirst = { k: m.k, got: s.readings.length };
    s.run(m, { k: WEEK, n: WEEK });
    // ASSERT
    expect({ afterFirst, afterSecond: { k: m.k, got: s.readings.length } }).toEqual(expected);
  });

  it('reads a beat shorter than the window over all of it', () => {
    // ARRANGE
    const end = WEEK;
    const s = createSampler({ start: 0, end, keys });
    const expected = { first: EIGHTH, count: 8 };
    // ACT
    s.run(clockModel(), { k: 0, n: end });
    // ASSERT
    expect({ first: stepsRead(s)[0], count: s.readings.length }).toEqual(expected);
  });

  it('reads the end once with a window of 0, as the reference build did', () => {
    // ARRANGE
    const end = 5 * WEEK;
    const s = createSampler({ start: 0, end, window: 0, keys });
    // ACT
    s.run(clockModel(), { k: 0, n: end });
    // ASSERT
    expect(stepsRead(s)).toEqual([end]);
  });
});
