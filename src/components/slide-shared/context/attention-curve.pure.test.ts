import { describe, expect, it } from 'vitest';
import {
  bucketOf,
  curveProblems,
  curveWeights,
  DEFAULT_CURVE,
  setShare,
  type Curve,
  type CurveKey,
} from './attention-curve.pure';

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const ids = (n: number) => Array.from({ length: n }, (_, i) => `m${i + 1}`);
const KEYS: readonly CurveKey[] = ['start', 'recent', 'middle', 'newest'];
const TOTAL = 100;
const PRECISION = 6;

/** The share each bucket got from a run of `n` rows. */
function perBucket(n: number, curve: Curve = DEFAULT_CURVE) {
  const weights = curveWeights(ids(n), curve);
  const out: Record<CurveKey, number> = { start: 0, recent: 0, middle: 0, newest: 0 };
  weights.forEach((w, i) => (out[bucketOf(i, n)] += w));
  return out;
}

describe('success cases', () => {
  it('puts the first three rows in start, the last three in newest, the seven before them in recent, the rest in middle', () => {
    // ARRANGE
    const rows = 28;
    const expected = { start: 3, newest: 3, recent: 7, middle: 15 };
    const probes = [2, 3, 17, 18, 24, 25];
    const expectedProbes = ['start', 'middle', 'middle', 'recent', 'recent', 'newest'];
    // ACT
    const buckets = Array.from({ length: rows }, (_, i) => bucketOf(i, rows));
    const actual = Object.fromEntries(KEYS.map((key) => [key, buckets.filter((b) => b === key).length]));
    // ASSERT
    expect(actual).toEqual(expected);
    expect(probes.map((i) => bucketOf(i, rows))).toEqual(expectedProbes);
  });

  it('gives each bucket its configured share of the 100 units, summing to 100', () => {
    // ARRANGE
    const rows = 28;
    const expected = { start: 20, recent: 20, middle: 30, newest: 30 };
    // ACT
    const weights = curveWeights(ids(rows), DEFAULT_CURVE);
    const actual = perBucket(rows);
    // ASSERT
    expect(sum(weights)).toBeCloseTo(TOTAL, PRECISION);
    for (const key of KEYS) expect(actual[key]).toBeCloseTo(expected[key], PRECISION);
  });

  it('is deterministic for the same ids and varies with other ids', () => {
    // ARRANGE
    const rows = 28;
    const a = ids(rows);
    const b = a.map((id) => `x${id}`);
    // ACT
    const first = curveWeights(a, DEFAULT_CURVE);
    const again = curveWeights(a, DEFAULT_CURVE);
    const other = curveWeights(b, DEFAULT_CURVE);
    // ASSERT
    expect(again).toEqual(first);
    expect(other).not.toEqual(first);
  });

  it('lets one or two middle rows take a clearly larger share', () => {
    // ARRANGE
    const rows = 28;
    const clearly = 2;
    const most = 2;
    const weights = curveWeights(ids(rows), DEFAULT_CURVE);
    const middle = weights.filter((_, i) => bucketOf(i, rows) === 'middle');
    // ACT
    const mean = sum(middle) / middle.length;
    const big = middle.filter((w) => w > clearly * mean).length;
    // ASSERT
    expect(big).toBeGreaterThanOrEqual(1);
    expect(big).toBeLessThanOrEqual(most);
  });

  it('moves one slider and spreads the difference evenly over the other three, always summing to 100', () => {
    // ARRANGE
    const moved = 36;
    const expected: Curve = { start: 18, recent: 18, middle: 28, newest: moved };
    // ACT
    const actual = setShare(DEFAULT_CURVE, 'newest', moved);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps every curve a whole-number split of 100 after any move', () => {
    // ARRANGE
    const moves: [CurveKey, number][] = [
      ['start', 7],
      ['middle', 61],
      ['recent', 3],
      ['newest', 44],
    ];
    // ACT
    const curves = moves.map(([key, value]) => setShare(DEFAULT_CURVE, key, value));
    // ASSERT
    for (const curve of curves) {
      expect(sum(Object.values(curve))).toBe(TOTAL);
      expect(Object.values(curve).every(Number.isInteger)).toBe(true);
    }
  });

  it('accepts a Preset curve that sums to 100', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const problems = curveProblems(DEFAULT_CURVE);
    // ASSERT
    expect(problems).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a Preset curve that does not sum to 100 or holds a negative share', () => {
    // ARRANGE
    const short: Curve = { start: 20, recent: 20, middle: 20, newest: 30 };
    const negative: Curve = { start: -5, recent: 25, middle: 50, newest: 30 };
    const expected = { count: 2, sum: '100', share: 'start' };
    // ACT
    const problems = [...curveProblems(short), ...curveProblems(negative)];
    // ASSERT
    expect(problems).toHaveLength(expected.count);
    expect(problems[0]).toContain(expected.sum);
    expect(problems[1]).toContain(expected.share);
  });

  it('clamps at 0 and at 100 and never drops another slider below 0', () => {
    // ARRANGE
    const all: Curve = { start: 0, recent: 0, middle: 0, newest: 100 };
    const above = 250;
    const below = -10;
    const drainedFrom: Curve = { start: 10, recent: 0, middle: 0, newest: 90 };
    // ACT
    const over = setShare(DEFAULT_CURVE, 'newest', above);
    const under = setShare(DEFAULT_CURVE, 'newest', below);
    const drained = setShare(drainedFrom, 'newest', TOTAL);
    // ASSERT
    expect(over).toEqual(all);
    expect(under.newest).toBe(0);
    expect(sum(Object.values(under))).toBe(TOTAL);
    expect(drained).toEqual(all);
  });

  it('spreads the difference over the sliders that still have room when one hits 0', () => {
    // ARRANGE
    const from: Curve = { start: 5, recent: 40, middle: 40, newest: 15 };
    const moved = 60;
    const atLeast = 20;
    // ACT
    const actual = setShare(from, 'newest', moved);
    // ASSERT
    expect(actual.start).toBe(0);
    expect(actual.newest).toBe(moved);
    expect(sum(Object.values(actual))).toBe(TOTAL);
    expect(actual.recent).toBeGreaterThanOrEqual(atLeast);
  });
});

describe('edge cases', () => {
  it('returns no weights for no rows and the whole 100 for one row', () => {
    // ARRANGE
    const expected: number[] = [];
    // ACT
    const none = curveWeights([], DEFAULT_CURVE);
    const one = curveWeights(['m1'], DEFAULT_CURVE);
    // ASSERT
    expect(none).toEqual(expected);
    expect(one[0]).toBeCloseTo(TOTAL, PRECISION);
  });

  it('sums to 100 for every small window', () => {
    // ARRANGE
    const sizes = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14];
    // ACT
    const sums = sizes.map((n) => sum(curveWeights(ids(n), DEFAULT_CURVE)));
    // ASSERT
    for (const total of sums) expect(total).toBeCloseTo(TOTAL, PRECISION);
  });

  it('gives start precedence over newest over recent where the buckets overlap on a small window', () => {
    // ARRANGE
    const five = ['start', 'start', 'start', 'newest', 'newest'];
    const eight = ['start', 'start', 'start', 'recent', 'recent', 'newest', 'newest', 'newest'];
    // ACT
    const small = five.map((_, i) => bucketOf(i, five.length));
    const larger = eight.map((_, i) => bucketOf(i, eight.length));
    // ASSERT
    expect(small).toEqual(five);
    expect(larger).toEqual(eight);
  });

  it('redistributes an empty bucket’s share proportionally over the others', () => {
    // ARRANGE
    const rows = 6; // start + newest only: no recent, no middle
    const expected = { start: 40, newest: 60 };
    // ACT
    const got = perBucket(rows);
    // ASSERT
    expect(got.recent).toBe(0);
    expect(got.middle).toBe(0);
    expect(got.start).toBeCloseTo(expected.start, PRECISION);
    expect(got.newest).toBeCloseTo(expected.newest, PRECISION);
  });
});
