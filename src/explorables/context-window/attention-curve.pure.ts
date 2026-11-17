// spec: docs/features/explorables/context-window.md#attention-layouts
export type CurveKey = 'start' | 'recent' | 'middle' | 'newest';
export type Curve = Readonly<Record<CurveKey, number>>;

export const CURVE_KEYS: readonly CurveKey[] = ['start', 'recent', 'middle', 'newest'];
export const DEFAULT_CURVE: Curve = { start: 20, recent: 20, middle: 25, newest: 35 };
export interface Falloff {
  readonly start: readonly number[];
  readonly newest: readonly number[];
}
export const DEFAULT_FALLOFF: Falloff = { start: [70, 20, 10], newest: [50, 30, 20] };
/** How far a start row's weight may wander, as a fraction, by the seeded random (0.15 is 85% to 115%). */
const START_JITTER = 0.15;

export const EDGE = 3;
const RECENT_SPAN = 7;

export function bucketOf(index: number, count: number): CurveKey {
  if (index < EDGE) return 'start';
  if (index >= count - EDGE) return 'newest';
  return index >= count - EDGE - RECENT_SPAN ? 'recent' : 'middle';
}

function seedOf(ids: readonly string[]): number {
  let hash = 2166136261;
  for (const char of ids.join('|')) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

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

function middleWeights(count: number, next: () => number): number[] {
  const weights = Array.from({ length: count }, () => 0.4 + next() * 0.8);
  const peaks = count >= 4 && next() > 0.5 ? 2 : 1;
  for (let p = 0; p < Math.min(peaks, count); p++) {
    const at = Math.min(count - 1, Math.floor(next() * count));
    weights[at] = 4 + next() * 3;
  }
  return weights;
}

function newestWeights(count: number, falloff: readonly number[]): number[] {
  return Array.from({ length: count }, (_, i) => falloff[count - 1 - i] ?? falloff.at(-1) ?? 1);
}

function startWeights(count: number, falloff: readonly number[], ids: readonly string[]): number[] {
  const next = random(seedOf(['start', ...ids]));
  return Array.from({ length: count }, (_, i) => {
    const base = falloff[i] ?? falloff.at(-1) ?? 1;
    return base * (1 - START_JITTER + next() * 2 * START_JITTER);
  });
}

function inside(key: CurveKey, count: number, ids: readonly string[]): number[] {
  if (key === 'middle') return middleWeights(count, random(seedOf(ids)));
  if (key === 'recent') return Array.from({ length: count }, (_, i) => 1 + (i + 1) / count);
  return Array.from({ length: count }, () => 1);
}

function relativeOf(key: CurveKey, falloff: Falloff, span: readonly string[]): number[] {
  const count = span.length;
  if (key === 'newest') return newestWeights(count, falloff.newest);
  return key === 'start' ? startWeights(count, falloff.start, span) : inside(key, count, span);
}

export function curveWeights(ids: readonly string[], curve: Curve, falloff: Falloff = DEFAULT_FALLOFF): number[] {
  const count = ids.length;
  if (count === 0) return [];
  const keys = ids.map((_, i) => bucketOf(i, count));
  const present = CURVE_KEYS.filter((key) => keys.includes(key));
  const total = present.reduce((sum, key) => sum + curve[key], 0);
  const out = new Array<number>(count).fill(0);
  for (const key of present) {
    const at = keys.flatMap((k, i) => (k === key ? [i] : []));
    const share = total > 0 ? (curve[key] / total) * 100 : 100 / present.length;
    const span = ids.slice(at[0], (at.at(-1) ?? 0) + 1);
    const relative = relativeOf(key, falloff, span);
    const whole = relative.reduce((a, b) => a + b, 0);
    at.forEach((row, j) => (out[row] = (share * (relative[j] ?? 0)) / whole));
  }
  return out;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

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

export function setShare(curve: Curve, key: CurveKey, value: number): Curve {
  const to = clamp(Math.round(value), 0, 100);
  const others = CURVE_KEYS.filter((k) => k !== key);
  const current = others.map((k) => curve[k]);
  const spreaded = spread(current, curve[key] - to);
  const sharesOf = wholes(spreaded, 100 - to);
  return { ...curve, ...Object.fromEntries(others.map((k, i) => [k, sharesOf[i] ?? 0])), [key]: to } as Curve;
}

export function curveProblems(curve: Curve): string[] {
  const bad = CURVE_KEYS.filter((key) => !(Number.isFinite(curve[key]) && curve[key] >= 0));
  if (bad.length) return bad.map((key) => `attention curve "${key}" must be a number from 0 up`);
  const total = CURVE_KEYS.reduce((sum, key) => sum + curve[key], 0);
  return total === 100 ? [] : [`attention curve must sum to 100, got ${total}`];
}

export function falloffProblems(falloff: Falloff): string[] {
  const good = (w: readonly number[]) => w.length === EDGE && w.every((n) => Number.isFinite(n) && n > 0);
  return [
    ...(good(falloff.start) ? [] : [`attention falloff.start must be ${EDGE} positive numbers, oldest first`]),
    ...(good(falloff.newest) ? [] : [`attention falloff.newest must be ${EDGE} positive numbers, newest first`]),
  ];
}

export function normalizeCurve(raw: Readonly<Record<CurveKey, number>>): Curve {
  const clean = CURVE_KEYS.map((key) => (Number.isFinite(raw[key]) && raw[key] > 0 ? raw[key] : 0));
  const total = clean.reduce((a, b) => a + b, 0);
  if (total === 0) return DEFAULT_CURVE;
  const sharesOf = wholes(
    clean.map((v) => (v / total) * 100),
    100,
  );
  return Object.fromEntries(CURVE_KEYS.map((key, i) => [key, sharesOf[i] ?? 0])) as Curve;
}

export const AXIS_STEPS: readonly number[] = [100, 50, 40, 30, 20];

export function axisMaxOf(shares: readonly number[]): number {
  const top = Math.max(0, ...shares);
  return [...AXIS_STEPS].reverse().find((step) => step >= top) ?? 100;
}
