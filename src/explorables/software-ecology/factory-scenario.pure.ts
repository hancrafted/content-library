/*
 * Scenarios: guided tours and checks, run on the model alone (design-ADR 0024 §10, §12). A preset may carry a tour
 * (steps: set dials, run to a week, pause, a caption at a card) or a check (one step). Every step's `expect:` is judged
 * by the same code in the page's tour and in the headless test.
 *
 * Expect vocabulary: { "<subject>.<measure>": "<test>" }, subject `customer` or a work center id, the measures those of
 * CUSTOMER_MEASURES and CENTER_MEASURES; test ">2", "<0.5", ">=1", "<=3", "0.9–1.1" (en dash or hyphen), "rises" or
 * "falls" (against the step before).
 */
import { custOf, DTW, firstOf, startSettings, WARM_WEEKS } from './factory-dials.pure.ts';
import { buildFactory } from './factory-model.pure.ts';
import {
  CENTER_MEASURES,
  CUSTOMER_MEASURES,
  type CenterMeasure,
  type CustomerMeasure,
} from './factory-readouts.pure.ts';
import { step, warm } from './factory-step.pure.ts';
import type { Factory } from './factory.types';
import type { Bundle, Cust, Over, Preset, Settings, StepSet, TourStep } from './software-ecology.types';

/** The value of one measure, `customer.output` or `qa.weeksWaiting`. */
export const metric = (m: Factory, key: string): number => {
  const [who, what] = key.split('.');
  if (who === 'customer') {
    const f = CUSTOMER_MEASURES[what as CustomerMeasure];
    if (!f) throw new Error(`unknown measure ${key}`);
    return f(m);
  }
  const n = m.nodes.get(who),
    f = CENTER_MEASURES[what as CenterMeasure];
  if (!n || n.kind !== 'role' || !f) throw new Error(`unknown measure ${key}`);
  return f(n);
};

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
export const validKey = (key: string, centerIds: ReadonlySet<string>): boolean => {
  const [who, what] = String(key).split('.');
  return who === 'customer' ? what in CUSTOMER_MEASURES : centerIds.has(who) && what in CENTER_MEASURES;
};

const SET_IN: Readonly<Record<string, keyof Over>> = {
  efficiency: 'eff',
  effectiveness: 'effv',
  fanout: 'fan',
  ai: 'ai',
  aiSpeed: 'aiSpeed',
  aiExtra: 'aiExtra',
};

const setDials = (dials: StepSet['dials'], s: Settings): void => {
  for (const [id, o] of Object.entries(dials ?? {})) {
    const x = (s.over[id] ??= {}) as Record<string, number | boolean>;
    for (const [k, v] of Object.entries(o)) x[SET_IN[k]] = v as number | boolean;
  }
};

/** The Customer after a step's changes: given fields replace, the rest stay as they are now. */
const setCustomer = (c: NonNullable<StepSet['customer']>, cu: Cust): Cust => ({
  ...cu,
  mix: { ...firstOf(c.mix, cu.mix) },
  good: { ...firstOf(c.good, cu.good) },
  bad: { ...firstOf(c.bad, cu.bad) },
  ...(c.rate !== undefined ? { rate: c.rate } : {}),
  ...(c.arrivals ? { mode: c.arrivals } : {}),
});

/** Applies a step's `set` to the settings in place: dials per center, the Customer, where AI works, the reality. */
export const applySet = (set: StepSet | undefined, m: Pick<Factory, 'B'>, s: Settings): void => {
  if (!set) return;
  if (set.reality !== undefined) s.reality = set.reality;
  if (set.ai !== undefined) s.ai = Array.isArray(set.ai) ? [...set.ai] : set.ai;
  setDials(set.dials, s);
  if (set.customer) s.cust = setCustomer(set.customer, custOf(m, s));
};

/** The steps of a preset: its tour, or its check as one step. */
export const stepsOf = (p: Preset): readonly TourStep[] => (p.tour ? p.tour : p.check ? [p.check] : []);
/** Weeks from the scenario start to model steps: the page and the runner stop on the same step. */
export const stepsTo = (weeks: number): number => Math.round(weeks / DTW);

export interface Check {
  readonly key: string;
  readonly test: string;
  readonly v: number;
  readonly prev?: number;
  readonly ok: boolean;
}
export interface ScenarioRow {
  readonly i: number;
  readonly week: number;
  readonly checks: readonly Check[];
}

/** The model a preset starts from: built at its settings, warmed 60 weeks unless it starts clear. */
export const scenarioStart = (B: Bundle, p: Preset, seed?: number): Factory => {
  const m = buildFactory(B, { s: startSettings(B, p), seed });
  if (p.start !== 'clear') warm(m, WARM_WEEKS);
  return m;
};

/** Runs every step of one preset headless, with a fixed seed: one row per step, each expect judged. */
export const runScenario = (B: Bundle, id: string, opts: { seed?: number } = {}): ScenarioRow[] => {
  const p = B.data.presets.find((x) => x.id === id);
  if (!p) throw new Error(`no preset ${id}`);
  const m = scenarioStart(B, p, opts.seed),
    k0 = Math.round(m.t / DTW),
    steps = stepsOf(p);
  const keys = [...new Set(steps.flatMap((st) => Object.keys(st.expect ?? {})))];
  let prev: Record<string, number> = {},
    k = k0;
  return steps.map((st, i) => {
    applySet(st.set, m, m.s);
    for (const kk = k0 + stepsTo(st.run); k < kk; k++) step(m);
    const vals = Object.fromEntries(keys.map((key) => [key, metric(m, key)]));
    const checks = Object.entries(st.expect ?? {}).map(([key, test]) => ({
      key,
      test,
      v: vals[key],
      prev: prev[key],
      ok: judge(vals[key], test, prev[key]),
    }));
    prev = vals;
    return { i, week: st.run, checks };
  });
};
