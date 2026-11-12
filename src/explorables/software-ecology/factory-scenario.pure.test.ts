import { describe, expect, it } from 'vitest';
import { judgeScenario, needOf, runScenario, stepsOf, type ScenarioRow } from './factory-scenario.pure.ts';
import { judge } from './scenario-tests.pure.ts';
import type { Bundle, Preset, TourStep } from './software-ecology.types';
import { BUILTIN, builtinBundle } from './use-case-data.ts';

/*
 * Every `expect:` of every scenario step, run on the model alone with the default seed: the value each measure reads
 * must equal, to two decimals, with no starting backlogs, what the reference build (docs/episodes/software-ecology/prototype/flow.html) read in
 * its headless run, checks7c.out.txt rows 1–88. [use case, preset, step (1-based; a check is step 1), measure, value]
 */
const REFERENCE: readonly (readonly [string, string, number, string, string])[] = [
  ['tire', 'ideal', 1, 'customer.output', '1.02'],
  ['tire', 'ideal', 1, 'customer.headroom', '1.45'],
  ['tire', 'ideal', 1, 'customer.leadDays', '2.86'],
  ['tire', 'ideal', 1, 'eng.weeksWaiting', '0.00'],
  ['tire', 'ideal', 1, 'qa.weeksWaiting', '0.00'],
  ['tire', 'realistic', 1, 'customer.output', '1.01'],
  ['tire', 'realistic', 1, 'customer.sat', '0.92'],
  ['tire', 'realistic', 1, 'customer.headroom', '1.18'],
  ['tire', 'realistic', 1, 'support.weeksWaiting', '0.05'],
  ['gate', 'ideal', 1, 'customer.output', '1.01'],
  ['gate', 'ideal', 1, 'customer.headroom', '1.43'],
  ['gate', 'ideal', 1, 'lrev.weeksWaiting', '0.00'],
  ['gate', 'realistic', 1, 'customer.output', '1.02'],
  ['gate', 'realistic', 1, 'customer.sat', '0.93'],
  ['gate', 'realistic', 1, 'customer.headroom', '1.18'],
  ['gate', 'realistic', 1, 'lrev.weeksWaiting', '0.08'],
  ['teams', 'ideal', 1, 'customer.output', '1.01'],
  ['teams', 'ideal', 1, 'customer.headroom', '1.43'],
  ['teams', 'ideal', 1, 'plat.weeksWaiting', '0.01'],
  ['teams', 'realistic', 1, 'customer.output', '1.04'],
  ['teams', 'realistic', 1, 'customer.sat', '0.98'],
  ['teams', 'realistic', 1, 'customer.headroom', '1.18'],
  ['teams', 'realistic', 1, 'plat.weeksWaiting', '0.25'],
];

/** The weeks the reference build's steps ran to; feedback 09 moved some later, so the seeded piles have drained. */
const REFERENCE_WEEKS: Readonly<Record<string, readonly number[]>> = {
  'tire/realistic': [12],
  'gate/realistic': [12],
  'teams/realistic': [12],
};
/** The use case as the reference build had it: no starting backlogs (feedback 09 added them on top of the model). */
const withoutKey = <T extends object>(o: T, key: string): T =>
  Object.fromEntries(Object.entries(o).filter(([k]) => k !== key)) as T;
const unloaded = (useCase: string): Bundle => {
  const B = builtinBundle(useCase);
  const data = withoutKey(B.data, 'backlog');
  const at = (p: Preset, i: number, run: number): number => REFERENCE_WEEKS[`${useCase}/${p.id}`]?.[i] ?? run;
  const weeks = (p: Preset): Preset => {
    const rest = withoutKey(p, 'backlog');
    if (rest.tour) return { ...rest, tour: rest.tour.map((st, i) => ({ ...st, run: at(p, i, st.run) })) };
    return rest.check ? { ...rest, check: { ...rest.check, run: at(p, 0, rest.check.run) } } : rest;
  };
  return { ...B, data: { ...data, presets: B.data.presets.map(weeks) } };
};
const runs = new Map<string, ScenarioRow[]>();
const rowsOf = (useCase: string, preset: string): ScenarioRow[] => {
  const k = `${useCase}/${preset}`;
  if (!runs.has(k)) runs.set(k, runScenario(unloaded(useCase), preset));
  return runs.get(k) as ScenarioRow[];
};
const loadedRows = new Map<string, ScenarioRow[]>();
const loadedRowsOf = (useCase: string, preset: string): ScenarioRow[] => {
  const k = `${useCase}/${preset}`;
  if (!loadedRows.has(k)) loadedRows.set(k, runScenario(builtinBundle(useCase), preset));
  return loadedRows.get(k) as ScenarioRow[];
};
interface Reading {
  readonly useCase: string;
  readonly preset: string;
  readonly step: number;
  readonly key: string;
  readonly value: string;
}
const READINGS: readonly Reading[] = REFERENCE.map(([useCase, preset, step, key, value]) => ({
  useCase,
  preset,
  step,
  key,
  value,
}));
const valueOf = (r: Reading): string | undefined =>
  rowsOf(r.useCase, r.preset)
    [r.step - 1]?.checks.find((c) => c.key === r.key)
    ?.v.toFixed(2);

/** Tire swing with one more scenario: Realistic, then the given beats. */
const withTour = (tour: readonly TourStep[]): Bundle => {
  const B = builtinBundle('tire');
  const p: Preset = { id: 'probe', view: 'factory', reality: 100, tour };
  return { ...B, data: { ...B.data, presets: [...B.data.presets, p] } };
};
const SEEDS = [1, 2, 3];
const AI_AT_ENG = { ai: ['eng'], dials: { eng: { aiExtra: 2 } } } as const;

/**
 * The states judged on the default seed alone: every check, and every tour without a claim. A tour whose beats carry
 * Han's claims is judged across ten seeds in `npm run test:build` (tests/post-build/ecology-scenarios.build.test.ts), by
 * the judge `npm run ecology:sim` runs (design-ADR 0024 §12), where a beat passes on 8 of 10 seeds, so one seed may fail it.
 */
const SCENARIOS = BUILTIN.flatMap((id) =>
  builtinBundle(id)
    .data.presets.filter((p) => p.check ?? (p.tour && !p.tour.some((st) => st.claim)))
    .map((p) => [id, p.id] as const),
);

describe('success cases', () => {
  it.each(READINGS)('$useCase $preset step $step: $key reads $value, as in the reference build', (reading) => {
    // ARRANGE
    const expected = reading.value;
    // ACT
    const seen = valueOf(reading);
    // ASSERT
    expect(seen).toBe(expected);
  });

  it.each(SCENARIOS)('%s %s: every claim of every step holds', (useCase, preset) => {
    // ARRANGE
    const failing: string[] = [];
    // ACT
    const failed = loadedRowsOf(useCase, preset).flatMap((r) =>
      r.checks.filter((c) => !c.ok).map((c) => `step ${r.i + 1} ${c.key} ${c.test} = ${c.v}`),
    );
    // ASSERT
    expect(failed).toEqual(failing);
  });

  it('passes a beat on every seed when the means of its last two weeks hold', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const expected = { passed: SEEDS.length, ok: true };
    // ACT
    const [beat] = judgeScenario(B, 'ideal', { seeds: SEEDS }).beats;
    // ASSERT
    expect({ passed: beat?.passed, ok: beat?.ok }).toEqual(expected);
  });

  it('judges rises against the same seed’s mean in the beat before', () => {
    // ARRANGE
    const B = withTour([
      { run: 6, expect: { 'qa.weeksWaiting': '>0' } },
      { set: AI_AT_ENG, run: 14, expect: { 'qa.weeksWaiting': 'rises' } },
    ]);
    const expected = SEEDS.length;
    // ACT
    const second = judgeScenario(B, 'probe', { seeds: SEEDS }).beats[1];
    // ASSERT
    expect(second?.passed).toBe(expected);
  });

  it('checks settles after the beat’s settings run 40 weeks more', () => {
    // ARRANGE
    const B = withTour([{ set: AI_AT_ENG, run: 6, settles: { 'qa.weeksWaiting': '>8' } }]);
    const pile = 8;
    // ACT
    const check = judgeScenario(B, 'probe', { seeds: SEEDS }).beats[0]?.checks.find((c) => c.kind === 'settles');
    // ASSERT
    expect(Math.min(...(check?.means ?? []))).toBeGreaterThan(pile);
  });
});

describe('failure cases', () => {
  it('fails a beat whose claim holds on no seed', () => {
    // ARRANGE
    const B = withTour([{ run: 6, expect: { 'customer.output': '>5' } }]);
    const expected = { passed: 0, ok: false };
    // ACT
    const [beat] = judgeScenario(B, 'probe', { seeds: SEEDS }).beats;
    // ASSERT
    expect({ passed: beat?.passed, ok: beat?.ok }).toEqual(expected);
  });

  it('fails a beat with a claim that runs longer than nine weeks, even when its checks hold', () => {
    // ARRANGE
    const B = withTour([{ run: 12, claim: 'clean', expect: { 'customer.output': '>0' } }]);
    const expected = { passed: SEEDS.length, ok: false };
    // ACT
    const [beat] = judgeScenario(B, 'probe', { seeds: SEEDS }).beats;
    // ASSERT
    expect({ passed: beat?.passed, ok: beat?.ok }).toEqual(expected);
  });

  it('judges a value outside its range as failing', () => {
    // ARRANGE
    const value = 1.2;
    const test = '0.95–1.05';
    // ACT
    const ok = judge(value, test);
    // ASSERT
    expect(ok).toBe(false);
  });
});

describe('edge cases', () => {
  it('needs 8 of 10 seeds, and every seed of a single one', () => {
    // ARRANGE
    const expected = [8, 1, 3];
    // ACT
    const need = [10, 1, 3].map(needOf);
    // ASSERT
    expect(need).toEqual(expected);
  });

  it('names only scenarios the files still have, with as many steps as the reference build ran', () => {
    // ARRANGE
    const refs = Object.entries(REFERENCE_WEEKS);
    // ACT
    const stepCounts = refs.map(([k, weeks]) => {
      const [useCase = '', preset = ''] = k.split('/');
      const p = builtinBundle(useCase).data.presets.find((x) => x.id === preset);
      return { key: k, steps: p ? stepsOf(p).length : -1, ran: weeks.length };
    });
    // ASSERT
    expect(stepCounts.filter((c) => c.steps !== c.ran)).toEqual([]);
  });

  it('judges rises as failing on the first step, which has nothing before it', () => {
    // ARRANGE
    const value = 3;
    // ACT
    const ok = judge(value, 'rises');
    // ASSERT
    expect(ok).toBe(false);
  });
});
