/*
 * Scenarios: guided tours and checks, run on the model alone (design-ADR 0024 §10, §12). A preset may carry a tour
 * (steps: set dials, run to a week, pause, a caption at a card) or a check (one step). Every step's `expect:` is judged
 * by the same code in the page's tour and in the headless test.
 *
 * Expect vocabulary: { "<subject>.<measure>": "<test>" }, subject `customer` or a work center id, the measures those of
 * CUSTOMER_MEASURES and CENTER_MEASURES; test ">2", "<0.5", ">=1", "<=3", "0.9–1.1" (en dash or hyphen), "rises" or
 * "falls" (against the step before).
 */
import { createSampler, stepsTo, type Values, WINDOW } from './beat-means.pure.ts';
import { type Beat, beatsOf, beatsOfSteps, stepsOf } from './factory-beats.pure.ts';
import { DTW, WARM_WEEKS } from './factory-dials.pure.ts';
import { copySettings, createFactory, DEFAULT_SEED, type FactoryHandle } from './factory-model.pure.ts';
import { applySet } from './scenario-set.pure.ts';
import { judge } from './scenario-tests.pure.ts';
import type { Bundle, Preset, Settings, StepSet, TourStep } from './software-ecology.types';
import { startBacklogOf } from './start-backlog.pure.ts';
import { startSettings } from './start-settings.pure.ts';

export { stepsOf };

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
  let k = stepsTo(f.weeks);
  for (const b of beatsOfSteps(steps, k)) {
    f.set(settingsAfter(b.set, B, f.settings));
    f.step((b.end - k) * DTW);
    k = Math.max(k, b.end);
    yield b.step;
  }
}

/*
 * Judging across seeds (design-ADR 0024 §12): the model stays stochastic, so one seed's reading proves little. A beat's
 * reading is the mean of each measure over its last WINDOW weeks; `rises` and `falls` compare those means with the
 * same seed's beat before; `settles:` is read after the beat's settings run SETTLE_WEEKS more, replayed from the start
 * with the same seed. A beat passes when at least needOf(seeds) seeds pass all its checks, and a beat with a `claim:`
 * also runs BEAT_WEEKS long.
 */

/** Weeks a `settles:` range waits after its beat. */
export const SETTLE_WEEKS = 40;
/** A beat with a claim runs this many weeks: 10 to 15 s at 20×. */
export const BEAT_WEEKS = [6, 9] as const;
/** The first `n` seeds in a row from the shipped one: the seeds a run of `n` is judged on. */
export const seedsFrom = (n: number): number[] => Array.from({ length: n }, (_, k) => DEFAULT_SEED + k);

/** The seeds a scenario is judged on by default: ten in a row from the shipped one. */
export const SEEDS = seedsFrom(10);

/** Seeds a beat must pass on: 8 of 10, and every seed of fewer than five. */
export const needOf = (seeds: number): number => (seeds < 5 ? seeds : Math.ceil(seeds * 0.8));

/** Runs a started model `weeks` on and reads the mean of the measures on the beat's sample steps. */
const runAveraged = (f: FactoryHandle, b: Pick<Beat, 'start' | 'end' | 'keys'>, window: number): Values => {
  const s = createSampler({ start: b.start, end: b.end, window, keys: b.keys });
  s.run(f, { k: b.start, n: b.end - b.start });
  return s.mean();
};

/** One seed's readings of one beat: the means at its end, and those SETTLE_WEEKS later when it has `settles:`. */
interface BeatReading {
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

/** Every beat of a preset on one seed, read as means over the last `window` weeks of each (WINDOW unless told). */
export const readBeats = (B: Bundle, p: Preset, x: { seed: number; window?: number }): BeatReading[] => {
  const settleKeys = keysIn(stepsOf(p), 'settles'),
    window = x.window ?? WINDOW,
    f = scenarioStart(B, p, x.seed);
  return beatsOf(p, stepsTo(f.weeks)).map((b) => {
    f.set(settingsAfter(b.set, B, f.settings));
    const values = runAveraged(f, b, window);
    if (!b.step.settles) return { values, settled: null };
    const g = playTo(B, p, { seed: x.seed, upTo: b.i }),
      start = stepsTo(g.weeks);
    return { values, settled: runAveraged(g, { start, end: start + stepsTo(SETTLE_WEEKS), keys: settleKeys }, window) };
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

/** Judges every beat of a preset across seeds; `window` 0 reads each beat's end once, as the page's tour does. */
export const judgeScenario = (
  B: Bundle,
  id: string,
  opts: { seeds?: readonly number[]; window?: number } = {},
): ScenarioVerdict => {
  const p = B.data.presets.find((x) => x.id === id);
  if (!p) throw new Error(`no preset ${id}`);
  const seeds = opts.seeds ?? SEEDS,
    need = needOf(seeds.length),
    runs = seeds.map((seed) => readBeats(B, p, { seed, window: opts.window }));
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

/**
 * Every step of one preset on one seed, each read as the mean over its last WINDOW weeks, as the page's tour reads it
 * (grill 11 Q224): one row per step, each expect judged. The seed judge with one seed; `window` 0 reads each step's
 * end once, as the reference build did.
 */
export const runScenario = (B: Bundle, id: string, opts: { seed?: number; window?: number } = {}): ScenarioRow[] =>
  judgeScenario(B, id, { seeds: [opts.seed ?? DEFAULT_SEED], window: opts.window }).beats.map((b) => ({
    i: b.i,
    week: b.week,
    checks: b.checks
      .filter((c) => c.kind === 'expect')
      .map((c) => ({ key: c.key, test: c.test, v: c.means[0] ?? NaN, prev: c.prev[0], ok: c.held[0] ?? false })),
  }));
