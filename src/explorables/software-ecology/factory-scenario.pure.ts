// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { createSampler, stepsTo, type Values, WINDOW_WEEKS } from './beat-means.pure.ts';
import { type Beat, beatsOf, beatsOfSteps, stepsOf } from './factory-beats.pure.ts';
import { WEEKS_PER_STEP, WARM_WEEKS } from './factory-dials.pure.ts';
import { copySettings, createFactory, DEFAULT_SEED, type FactoryHandle } from './factory-model.pure.ts';
import { applySet } from './scenario-set.pure.ts';
import { judge } from './scenario-tests.pure.ts';
import type { Bundle, Preset, Settings, StepSet, TourStep } from './software-ecology.types';
import { startBacklogOf } from './start-backlog.pure.ts';
import { startSettings } from './start-settings.pure.ts';

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

export const settingsAfter = (set: StepSet | undefined, B: Bundle, now: Settings): Settings => {
  const s = copySettings(now);
  applySet(set, { B }, s);
  return s;
};

export const scenarioStart = (B: Bundle, p: Preset, seed: number = DEFAULT_SEED): FactoryHandle => {
  const f = createFactory(B, startSettings(B, p), seed);
  if (p.start === 'clear') return f;
  f.step(WARM_WEEKS);
  f.pile(startBacklogOf(B, p, f.settings.reality));
  return f;
};

export function* playSteps(f: FactoryHandle, B: Bundle, steps: readonly TourStep[]): Generator<TourStep> {
  let k = stepsTo(f.weeks);
  for (const b of beatsOfSteps(steps, k)) {
    f.set(settingsAfter(b.set, B, f.settings));
    f.step((b.end - k) * WEEKS_PER_STEP);
    k = Math.max(k, b.end);
    yield b.step;
  }
}

export const SETTLE_WEEKS = 40;
export const BEAT_WEEKS = [6, 9] as const;
export const seedsFrom = (n: number): number[] => Array.from({ length: n }, (_, k) => DEFAULT_SEED + k);

export const SEEDS = seedsFrom(10);

export const needOf = (seeds: number): number => (seeds < 5 ? seeds : Math.ceil(seeds * 0.8));

const runAveraged = (f: FactoryHandle, b: Pick<Beat, 'start' | 'end' | 'keys'>, window: number): Values => {
  const s = createSampler({ start: b.start, end: b.end, window, keys: b.keys });
  s.run(f, { k: b.start, n: b.end - b.start });
  return s.mean();
};

interface BeatReading {
  readonly values: Values;
  readonly settled: Values | null;
}

const keysIn = (steps: readonly TourStep[], field: 'expect' | 'settles'): string[] => [
  ...new Set(steps.flatMap((st) => Object.keys(st[field] ?? {}))),
];

const playTo = (B: Bundle, p: Preset, x: { seed: number; upTo: number }): FactoryHandle => {
  const f = scenarioStart(B, p, x.seed),
    steps = stepsOf(p).slice(0, x.upTo + 1);
  Array.from(playSteps(f, B, steps));
  return f;
};

export const readBeats = (B: Bundle, p: Preset, x: { seed: number; window?: number }): BeatReading[] => {
  const settleKeys = keysIn(stepsOf(p), 'settles'),
    window = x.window ?? WINDOW_WEEKS,
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
  readonly length: number;
  readonly lengthOk: boolean;
  readonly checks: readonly SeedCheck[];
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

export const runScenario = (B: Bundle, id: string, opts: { seed?: number; window?: number } = {}): ScenarioRow[] =>
  judgeScenario(B, id, { seeds: [opts.seed ?? DEFAULT_SEED], window: opts.window }).beats.map((b) => ({
    i: b.i,
    week: b.week,
    checks: b.checks
      .filter((c) => c.kind === 'expect')
      .map((c) => ({ key: c.key, test: c.test, v: c.means[0] ?? NaN, prev: c.prev[0], ok: c.held[0] ?? false })),
  }));
