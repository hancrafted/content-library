/*
 * The Attention part's distribution curve: how the 100 units split over the rows of the window, oldest first. The
 * first three rows are the `start`, the last three the `newest`, the seven before them the `recent`, and every row
 * between is the `middle`, where a seeded random gives one or two rows a clearly larger share.
 */

export type CurveKey = 'start' | 'recent' | 'middle' | 'newest';
/** The percent of the attention each bucket gets; whole numbers summing to 100. */
export type Curve = Readonly<Record<CurveKey, number>>;

export const CURVE_KEYS: readonly CurveKey[] = ['start', 'recent', 'middle', 'newest'];
export const DEFAULT_CURVE: Curve = { start: 20, recent: 20, middle: 30, newest: 30 };

/** Rows at the start and at the newest end that never compress, and how many rows the recent bucket spans. */
export const EDGE = 3;
const RECENT_SPAN = 7;

/** Which bucket a row falls in; where buckets overlap on a small window, start beats newest beats recent. */
export function bucketOf(index: number, count: number): CurveKey {
  if (index < EDGE) return 'start';
  if (index >= count - EDGE) return 'newest';
  return index >= count - EDGE - RECENT_SPAN ? 'recent' : 'middle';
}

/** FNV-1a over the ids, so the same chat always seeds the same middle. */
function seedOf(ids: readonly string[]): number {
  let hash = 2166136261;
  for (const char of ids.join('|')) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

/** mulberry32: a small seeded generator returning numbers in [0, 1). */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Relative weights of the middle rows: noisy and low, with one or two peaks well above the rest. */
function middleWeights(count: number, next: () => number): number[] {
  const weights = Array.from({ length: count }, () => 0.4 + next() * 0.8);
  const peaks = count >= 4 && next() > 0.5 ? 2 : 1;
  for (let p = 0; p < Math.min(peaks, count); p++) {
    const at = Math.min(count - 1, Math.floor(next() * count));
    weights[at] = 4 + next() * 3;
  }
  return weights;
}

/** Relative weights inside a bucket: equal, except the recent rows fall off away from the newest. */
function inside(key: CurveKey, count: number, ids: readonly string[]): number[] {
  if (key === 'middle') return middleWeights(count, random(seedOf(ids)));
  if (key === 'recent') return Array.from({ length: count }, (_, i) => 1 + (i + 1) / count);
  return Array.from({ length: count }, () => 1);
}

/**
 * The share of each row, oldest first, summing to 100. A bucket with no rows gives its share to the others in
 * proportion to theirs.
 */
export function curveWeights(ids: readonly string[], curve: Curve): number[] {
  const count = ids.length;
  if (count === 0) return [];
  const keys = ids.map((_, i) => bucketOf(i, count));
  const present = CURVE_KEYS.filter((key) => keys.includes(key));
  const total = present.reduce((sum, key) => sum + curve[key], 0);
  const out = new Array<number>(count).fill(0);
  for (const key of present) {
    const at = keys.flatMap((k, i) => (k === key ? [i] : []));
    const share = total > 0 ? (curve[key] / total) * 100 : 100 / present.length;
    const relative = inside(key, at.length, ids.slice(at[0], (at.at(-1) ?? 0) + 1));
    const whole = relative.reduce((a, b) => a + b, 0);
    at.forEach((row, j) => (out[row] = (share * (relative[j] ?? 0)) / whole));
  }
  return out;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Water-filling: takes `amount` (positive or negative) from the others evenly, none going under 0. */
function spread(others: readonly number[], amount: number): number[] {
  const out = [...others];
  let left = amount;
  for (let pass = 0; pass < others.length && Math.abs(left) > 1e-9; pass++) {
    const open = out.flatMap((v, i) => (left > 0 || v > 0 ? [i] : []));
    if (open.length === 0) break;
    const each = left / open.length;
    for (const i of open) {
      const next = Math.max(0, (out[i] ?? 0) + each);
      left -= next - (out[i] ?? 0);
      out[i] = next;
    }
  }
  return out;
}

/** Whole numbers from shares summing to `total`, the leftover going to the largest remainders. */
function wholes(shares: readonly number[], total: number): number[] {
  const floors = shares.map(Math.floor);
  let left = total - floors.reduce((a, b) => a + b, 0);
  const order = shares.map((s, i) => [s - Math.floor(s), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    left -= 1;
  }
  return floors;
}

/** A slider moved to `value`: the others share the difference evenly (none under 0) and the curve still sums to 100. */
export function setShare(curve: Curve, key: CurveKey, value: number): Curve {
  const to = clamp(Math.round(value), 0, 100);
  const others = CURVE_KEYS.filter((k) => k !== key);
  const current = others.map((k) => curve[k]);
  const spreaded = spread(current, curve[key] - to);
  const sharesOf = wholes(spreaded, 100 - to);
  return { ...curve, ...Object.fromEntries(others.map((k, i) => [k, sharesOf[i] ?? 0])), [key]: to } as Curve;
}

/** What is wrong with a Preset's curve: a share that is not a non-negative number, or a sum other than 100. */
export function curveProblems(curve: Curve): string[] {
  const bad = CURVE_KEYS.filter((key) => !(Number.isFinite(curve[key]) && curve[key] >= 0));
  if (bad.length) return bad.map((key) => `attention curve "${key}" must be a number from 0 up`);
  const total = CURVE_KEYS.reduce((sum, key) => sum + curve[key], 0);
  return total === 100 ? [] : [`attention curve must sum to 100, got ${total}`];
}
