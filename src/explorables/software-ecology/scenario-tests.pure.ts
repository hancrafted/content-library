// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
export type Comparison = '>' | '<' | '>=' | '<=';
export type Test =
  | { readonly kind: 'compare'; readonly op: Comparison; readonly k: number }
  | { readonly kind: 'range'; readonly lo: number; readonly hi: number }
  | { readonly kind: 'rises' | 'falls' };

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

export const judge = (v: number, test: string, prev?: number): boolean => {
  const t = parseTest(test);
  if (!t) throw new Error(`unknown test "${test}"`);
  if (t.kind === 'compare') return COMPARE[t.op](v, t.k);
  if (t.kind === 'range') return v >= t.lo && v <= t.hi;
  if (prev === undefined) return false;
  return t.kind === 'rises' ? v > prev : v < prev;
};

export const validTest = (t: string): boolean => parseTest(t) !== null;
