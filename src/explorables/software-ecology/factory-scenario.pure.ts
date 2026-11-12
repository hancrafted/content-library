/*
 * Scenarios: guided tours and checks, run on the model alone (design-ADR 0024 §10, §12). A preset may carry a tour
 * (steps: set dials, run to a week, pause, a caption at a card) or a check (one step). Every step's `expect:` is judged
 * by the same code in the page's tour and in the headless test.
 *
 * Expect vocabulary: { "<subject>.<measure>": "<test>" }, subject `customer` or a work center id, the measures those of
 * CUSTOMER_MEASURES and CENTER_MEASURES; test ">2", "<0.5", ">=1", "<=3", "0.9–1.1" (en dash or hyphen), "rises" or
 * "falls" (against the step before).
 */
import { DTW, startSettings, WARM_WEEKS } from './factory-dials.pure.ts';
import { copySettings, createFactory, DEFAULT_SEED, type FactoryHandle } from './factory-model.pure.ts';
import { applySet } from './scenario-set.pure.ts';
import { judge } from './scenario-tests.pure.ts';
import type { Bundle, Preset, Settings, StepSet, TourStep } from './software-ecology.types';
import { startBacklogOf } from './start-backlog.pure.ts';

export { validKey } from './factory-model.pure.ts';
export { applySet } from './scenario-set.pure.ts';
export { judge, parseTest, validTest } from './scenario-tests.pure.ts';

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

/** The settings after a step's `set`: a copy, handed to the model whole. */
export const settingsAfter = (set: StepSet | undefined, B: Bundle, now: Settings): Settings => {
  const s = copySettings(now);
  applySet(set, { B }, s);
  return s;
};

/** The model a preset starts from: built at its settings, warmed 60 weeks unless it starts clear, then loaded with the state's starting backlogs. */
export const scenarioStart = (B: Bundle, p: Preset, seed: number = DEFAULT_SEED): FactoryHandle => {
  const f = createFactory(B, startSettings(B, p), seed);
  if (p.start === 'clear') return f;
  f.step(WARM_WEEKS);
  f.pile(startBacklogOf(B, p, f.settings.reality));
  return f;
};

/** Plays a started model through `steps`: each sets its dials, then runs to its week; yields after each. */
export function* playSteps(f: FactoryHandle, B: Bundle, steps: readonly TourStep[]): Generator<TourStep> {
  const k0 = Math.round(f.weeks / DTW);
  let k = k0;
  for (const st of steps) {
    f.set(settingsAfter(st.set, B, f.settings));
    const kk = k0 + stepsTo(st.run);
    f.step((kk - k) * DTW);
    k = Math.max(k, kk);
    yield st;
  }
}

/** Runs every step of one preset headless, with a fixed seed: one row per step, each expect judged. */
export const runScenario = (B: Bundle, id: string, opts: { seed?: number } = {}): ScenarioRow[] => {
  const p = B.data.presets.find((x) => x.id === id);
  if (!p) throw new Error(`no preset ${id}`);
  const f = scenarioStart(B, p, opts.seed),
    steps = stepsOf(p);
  const keys = [...new Set(steps.flatMap((st) => Object.keys(st.expect ?? {})))];
  const rows: ScenarioRow[] = [];
  let prev: Record<string, number> = {};
  for (const st of playSteps(f, B, steps)) {
    const vals = f.read({ measures: keys }).measures as Record<string, number>;
    const checks = Object.entries(st.expect ?? {}).map(([key, test]) => ({
      key,
      test,
      v: vals[key],
      prev: prev[key],
      ok: judge(vals[key], test, prev[key]),
    }));
    prev = vals;
    rows.push({ i: rows.length, week: st.run, checks });
  }
  return rows;
};

/*
 * Judging across seeds (design-ADR 0024 §12): the model stays stochastic, so one seed's reading proves little. A beat's
 * reading is the mean of each measure over its last WINDOW weeks; `rises` and `falls` compare those means with the
 * same seed's beat before; `settles:` is read after the beat's settings run SETTLE_WEEKS more, replayed from the start
 * with the same seed. A beat passes when at least needOf(seeds) seeds pass all its checks, and a beat with a `claim:`
 * also runs BEAT_WEEKS long.
 */

/** Weeks at a beat's end its readings are averaged over. */
export const WINDOW = 2;
/** Samples a week inside the window. */
const SAMPLES_A_WEEK = 8;
/** Weeks a `settles:` range waits after its beat. */
export const SETTLE_WEEKS = 40;
/** A beat with a claim runs this many weeks: 10 to 15 s at 20×. */
export const BEAT_WEEKS = [6, 9] as const;
/** The seeds a scenario is judged on by default: ten in a row from the shipped one. */
export const SEEDS = Array.from({ length: 10 }, (_, k) => DEFAULT_SEED + k);

/** Seeds a beat must pass on: 8 of 10, and every seed of fewer than five. */
export const needOf = (seeds: number): number => (seeds < 5 ? seeds : Math.ceil(seeds * 0.8));

type Values = Record<string, number>;

/** Runs a started model `weeks` on, averaging the measures over the last WINDOW weeks of it. */
const runAveraged = (f: FactoryHandle, weeks: number, keys: readonly string[]): Values => {
  const k = stepsTo(weeks),
    w = Math.min(k, stepsTo(WINDOW)),
    every = Math.max(1, Math.round(1 / SAMPLES_A_WEEK / DTW));
  f.step((k - w) * DTW);
  const sum: Values = Object.fromEntries(keys.map((x) => [x, 0]));
  let n = 0;
  for (let done = 0; done < w;) {
    const by = Math.min(every, w - done);
    f.step(by * DTW);
    done += by;
    const v = f.read({ measures: keys }).measures;
    for (const x of keys) sum[x] += v[x] ?? 0;
    n++;
  }
  return Object.fromEntries(keys.map((x) => [x, n ? sum[x] / n : 0]));
};

/** One seed's readings of one beat: the means at its end, and those SETTLE_WEEKS later when it has `settles:`. */
export interface BeatReading {
  readonly values: Values;
  readonly settled: Values | null;
}

const keysIn = (steps: readonly TourStep[], field: 'expect' | 'settles'): string[] => [
  ...new Set(steps.flatMap((st) => Object.keys(st[field] ?? {}))),
];

/** The model of a preset played to the end of beat `upTo`, each beat set and run to its week. */
const playTo = (B: Bundle, p: Preset, x: { seed: number; upTo: number }): FactoryHandle => {
  const f = scenarioStart(B, p, x.seed),
    steps = stepsOf(p).slice(0, x.upTo + 1);
  Array.from(playSteps(f, B, steps));
  return f;
};

/** Every beat of a preset on one seed, read as means. */
export const readBeats = (B: Bundle, p: Preset, seed: number): BeatReading[] => {
  const steps = stepsOf(p),
    keys = keysIn(steps, 'expect'),
    settleKeys = keysIn(steps, 'settles'),
    f = scenarioStart(B, p, seed);
  let last = 0;
  return steps.map((st, i) => {
    f.set(settingsAfter(st.set, B, f.settings));
    const values = runAveraged(f, st.run - last, keys);
    last = st.run;
    if (!st.settles) return { values, settled: null };
    const g = playTo(B, p, { seed, upTo: i });
    return { values, settled: runAveraged(g, SETTLE_WEEKS, settleKeys) };
  });
};

/** One check of a beat across seeds: its mean on each seed, and whether it held there. */
export interface SeedCheck {
  readonly key: string;
  readonly test: string;
  readonly kind: 'expect' | 'settles';
  readonly means: readonly number[];
  readonly prev: readonly (number | undefined)[];
  readonly held: readonly boolean[];
}

export interface BeatVerdict {
  readonly i: number;
  readonly claim?: string;
  readonly week: number;
  /** Weeks since the beat before. */
  readonly length: number;
  /** Whether a beat with a claim runs BEAT_WEEKS long; true for a beat without one. */
  readonly lengthOk: boolean;
  readonly checks: readonly SeedCheck[];
  /** Seeds on which every check held. */
  readonly passed: number;
  readonly of: number;
  readonly ok: boolean;
}

export interface ScenarioVerdict {
  readonly id: string;
  readonly seeds: readonly number[];
  readonly need: number;
  readonly beats: readonly BeatVerdict[];
  readonly ok: boolean;
}

const checksOf = (st: TourStep, x: { i: number; runs: readonly BeatReading[][] }): SeedCheck[] => {
  const one = (kind: SeedCheck['kind']) => (key: string, test: string) => {
    const means = x.runs.map((r) => (kind === 'expect' ? r[x.i]?.values : r[x.i]?.settled)?.[key] ?? NaN);
    const prev = x.runs.map((r) => (kind === 'expect' && x.i > 0 ? r[x.i - 1]?.values[key] : undefined));
    return { key, test, kind, means, prev, held: means.map((v, s) => judge(v, test, prev[s])) };
  };
  return [
    ...Object.entries(st.expect ?? {}).map(([k, t]) => one('expect')(k, t)),
    ...Object.entries(st.settles ?? {}).map(([k, t]) => one('settles')(k, t)),
  ];
};

/** Judges every beat of a preset across seeds. */
export const judgeScenario = (B: Bundle, id: string, opts: { seeds?: readonly number[] } = {}): ScenarioVerdict => {
  const p = B.data.presets.find((x) => x.id === id);
  if (!p) throw new Error(`no preset ${id}`);
  const seeds = opts.seeds ?? SEEDS,
    need = needOf(seeds.length),
    runs = seeds.map((seed) => readBeats(B, p, seed));
  const beats = stepsOf(p).map((st, i, all): BeatVerdict => {
    const checks = checksOf(st, { i, runs }),
      length = st.run - (all[i - 1]?.run ?? 0),
      lengthOk = !st.claim || (length >= BEAT_WEEKS[0] && length <= BEAT_WEEKS[1]),
      passed = seeds.filter((_, s) => checks.every((c) => c.held[s])).length;
    return {
      i,
      claim: st.claim,
      week: st.run,
      length,
      lengthOk,
      checks,
      passed,
      of: seeds.length,
      ok: lengthOk && passed >= need,
    };
  });
  return { id, seeds, need, beats, ok: beats.every((b) => b.ok) };
};
