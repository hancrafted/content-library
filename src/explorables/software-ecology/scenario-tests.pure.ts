/*
 * The tests a scenario's `expect:` and `settles:` hold its readings to (design-ADR 0024 §10): ">2", "<0.5", ">=1",
 * "<=3", "0.9–1.1" (en dash or hyphen), "rises" or "falls" (against the beat before).
 */

export type Comparison = '>' | '<' | '>=' | '<=';
/** A test, parsed: a comparison with a bound, a range, or a trend against the step before. */
export type Test =
  | { readonly kind: 'compare'; readonly op: Comparison; readonly k: number }
  | { readonly kind: 'range'; readonly lo: number; readonly hi: number }
  | { readonly kind: 'rises' | 'falls' };

/** Parses a test, or null when it is not one. */
export const parseTest = (test: string): Test | null => {
  const t = String(test).trim();
  if (t === 'rises' || t === 'falls') return { kind: t };
  const c = /^(>=|<=|>|<)\s*(-?[\d.]+)$/.exec(t);
  if (c) return { kind: 'compare', op: c[1] as Comparison, k: Number(c[2]) };
  const r = /^(-?[\d.]+)\s*[–-]\s*(-?[\d.]+)$/.exec(t);
  return r ? { kind: 'range', lo: Number(r[1]), hi: Number(r[2]) } : null;
};

const COMPARE: Readonly<Record<Comparison, (v: number, k: number) => boolean>> = {
  '>': (v, k) => v > k,
  '<': (v, k) => v < k,
  '>=': (v, k) => v >= k,
  '<=': (v, k) => v <= k,
};

/** Judges one value against a test; `prev` is the same measure at the step before (for rises / falls). */
export const judge = (v: number, test: string, prev?: number): boolean => {
  const t = parseTest(test);
  if (!t) throw new Error(`unknown test "${test}"`);
  if (t.kind === 'compare') return COMPARE[t.op](v, t.k);
  if (t.kind === 'range') return v >= t.lo && v <= t.hi;
  if (prev === undefined) return false;
  return t.kind === 'rises' ? v > prev : v < prev;
};

export const validTest = (t: string): boolean => parseTest(t) !== null;
