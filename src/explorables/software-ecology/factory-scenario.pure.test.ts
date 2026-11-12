import { describe, expect, it } from 'vitest';
import { judge, runScenario, stepsOf, type ScenarioRow } from './factory-scenario.pure.ts';
import type { Bundle, Preset } from './software-ecology.types';
import { BUILTIN, builtinBundle } from './use-case-data.ts';

/*
 * Every `expect:` of every scenario step, run on the model alone with the default seed: the value each measure reads
 * must equal, to two decimals, with no starting backlogs, what the reference build (docs/episodes/software-ecology/prototype/flow.html) read in
 * its headless run, checks7c.out.txt rows 1–88. [use case, preset, step (1-based; a check is step 1), measure, value]
 */
const REFERENCE: readonly (readonly [string, string, number, string, string])[] = [
  ['tire', 'ideal', 1, 'customer.output', '1.02'],
  ['tire', 'ideal', 1, 'customer.headroom', '1.46'],
  ['tire', 'ideal', 1, 'customer.leadDays', '2.85'],
  ['tire', 'ideal', 1, 'eng.weeksWaiting', '0.00'],
  ['tire', 'ideal', 1, 'qa.weeksWaiting', '0.00'],
  ['tire', 'realistic', 1, 'customer.output', '1.03'],
  ['tire', 'realistic', 1, 'customer.sat', '0.98'],
  ['tire', 'realistic', 1, 'customer.headroom', '1.18'],
  ['tire', 'realistic', 1, 'support.weeksWaiting', '0.33'],
  ['tire', 'speed-up', 1, 'customer.output', '1.09'],
  ['tire', 'speed-up', 1, 'eng.weeksWaiting', '0.05'],
  ['tire', 'speed-up', 2, 'customer.output', '1.02'],
  ['tire', 'speed-up', 2, 'eng.weeksWaiting', '0.00'],
  ['tire', 'speed-up', 3, 'customer.output', '0.94'],
  ['tire', 'speed-up', 3, 'customer.headroom', '1.43'],
  ['tire', 'ai-unbalanced', 1, 'customer.output', '1.09'],
  ['tire', 'ai-unbalanced', 1, 'qa.weeksWaiting', '0.01'],
  ['tire', 'ai-unbalanced', 2, 'qa.weeksWaiting', '2.33'],
  ['tire', 'ai-unbalanced', 2, 'customer.headroom', '0.55'],
  ['tire', 'ai-unbalanced', 3, 'customer.output', '0.53'],
  ['tire', 'ai-unbalanced', 3, 'qa.weeksWaiting', '10.04'],
  // not in the reference build's checks: the hero preview's static numbers pin this step (0.53, 10.04, 223 waiting)
  ['tire', 'ai-unbalanced', 3, 'qa.backlog', '223.00'],
  ['tire', 'ai-compare', 1, 'eng.weeksWaiting', '0.00'],
  ['tire', 'ai-compare', 1, 'qa.weeksWaiting', '33.64'],
  ['tire', 'ai-compare', 2, 'customer.output', '0.51'],
  ['tire', 'ai-compare', 3, 'qa.weeksWaiting', '42.36'],
  ['tire', 'ai-everywhere', 1, 'customer.output', '1.09'],
  ['tire', 'ai-everywhere', 1, 'customer.headroom', '1.18'],
  ['tire', 'ai-everywhere', 2, 'customer.output', '1.15'],
  ['tire', 'ai-everywhere', 2, 'customer.leadDays', '2.79'],
  ['tire', 'ai-everywhere', 2, 'customer.headroom', '2.53'],
  ['tire', 'ai-everywhere', 3, 'customer.leadDays', '2.45'],
  ['tire', 'ai-everywhere', 3, 'eng.weeksWaiting', '0.00'],
  ['tire', 'ai-everywhere', 3, 'qa.weeksWaiting', '0.00'],
  ['tire', 'ai-balanced', 1, 'customer.output', '2.50'],
  ['tire', 'ai-balanced', 2, 'customer.sat', '0.93'],
  ['tire', 'ai-balanced', 2, 'qa.weeksWaiting', '0.00'],
  ['tire', 'ai-balanced', 3, 'customer.output', '2.40'],
  ['tire', 'ai-balanced', 3, 'customer.sat', '0.93'],
  ['tire', 'ai-balanced', 3, 'customer.headroom', '1.33'],
  ['tire', 'bug-spiral', 1, 'customer.output', '0.57'],
  ['tire', 'bug-spiral', 1, 'customer.bugsPerWeek', '0.53'],
  ['tire', 'bug-spiral', 2, 'eng.weeksWaiting', '2.61'],
  ['tire', 'bug-spiral', 2, 'eng.rush', '12.06'],
  ['tire', 'bug-spiral', 3, 'eng.weeksWaiting', '3.53'],
  ['tire', 'bug-spiral', 3, 'customer.leadDays', '26.79'],
  ['tire', 'bug-spiral', 3, 'customer.output', '0.62'],
  ['tire', 'bug-spiral', 4, 'customer.output', '0.68'],
  ['tire', 'bug-spiral', 4, 'customer.leadDays', '62.80'],
  ['tire', 'bug-spiral', 4, 'eng.weeksWaiting', '8.98'],
  ['tire', 'fix-orders', 1, 'eng.rework', '0.19'],
  ['tire', 'fix-orders', 1, 'customer.headroom', '0.96'],
  ['tire', 'fix-orders', 2, 'eng.rework', '0.13'],
  ['tire', 'fix-orders', 2, 'customer.headroom', '1.13'],
  ['tire', 'fix-orders', 3, 'eng.weeksWaiting', '0.30'],
  ['tire', 'fix-orders', 3, 'customer.leadDays', '4.89'],
  ['tire', 'move-bottleneck', 1, 'eng.weeksWaiting', '7.25'],
  ['tire', 'move-bottleneck', 1, 'qa.weeksWaiting', '0.00'],
  ['tire', 'move-bottleneck', 2, 'eng.weeksWaiting', '0.00'],
  ['tire', 'move-bottleneck', 2, 'qa.weeksWaiting', '4.41'],
  ['tire', 'move-bottleneck', 3, 'qa.weeksWaiting', '0.00'],
  ['tire', 'move-bottleneck', 3, 'customer.leadDays', '25.90'],
  ['tire', 'move-bottleneck', 3, 'customer.headroom', '1.14'],
  ['gate', 'ideal', 1, 'customer.output', '1.01'],
  ['gate', 'ideal', 1, 'customer.headroom', '1.43'],
  ['gate', 'ideal', 1, 'lrev.weeksWaiting', '0.00'],
  ['gate', 'realistic', 1, 'customer.output', '1.02'],
  ['gate', 'realistic', 1, 'customer.sat', '0.93'],
  ['gate', 'realistic', 1, 'customer.headroom', '1.18'],
  ['gate', 'realistic', 1, 'lrev.weeksWaiting', '0.08'],
  ['gate', 'speed-up', 1, 'customer.output', '1.00'],
  ['gate', 'speed-up', 1, 'e2.weeksWaiting', '0.00'],
  ['gate', 'speed-up', 1, 'customer.headroom', '1.18'],
  ['gate', 'ai-unbalanced', 1, 'customer.output', '0.51'],
  ['gate', 'ai-unbalanced', 1, 'lrev.weeksWaiting', '7.98'],
  ['gate', 'ai-unbalanced', 1, 'customer.headroom', '0.59'],
  ['teams', 'ideal', 1, 'customer.output', '1.01'],
  ['teams', 'ideal', 1, 'customer.headroom', '1.43'],
  ['teams', 'ideal', 1, 'plat.weeksWaiting', '0.01'],
  ['teams', 'realistic', 1, 'customer.output', '1.04'],
  ['teams', 'realistic', 1, 'customer.sat', '0.98'],
  ['teams', 'realistic', 1, 'customer.headroom', '1.18'],
  ['teams', 'realistic', 1, 'plat.weeksWaiting', '0.25'],
  ['teams', 'speed-up', 1, 'customer.output', '1.05'],
  ['teams', 'speed-up', 1, 'engB.weeksWaiting', '0.01'],
  ['teams', 'speed-up', 1, 'customer.headroom', '1.18'],
  ['teams', 'ai-unbalanced', 1, 'customer.output', '0.34'],
  ['teams', 'ai-unbalanced', 1, 'plat.weeksWaiting', '66.65'],
  ['teams', 'ai-unbalanced', 1, 'customer.headroom', '0.42'],
];

/** The weeks the reference build's steps ran to; feedback 09 moved some later, so the seeded piles have drained. */
const REFERENCE_WEEKS: Readonly<Record<string, readonly number[]>> = {
  'tire/realistic': [12],
  'tire/speed-up': [6, 16, 24],
  'tire/ai-everywhere': [4, 12, 20],
  'tire/ai-balanced': [4, 12, 20],
  'gate/realistic': [12],
  'gate/speed-up': [16],
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

const SCENARIOS = BUILTIN.flatMap((id) =>
  builtinBundle(id)
    .data.presets.filter((p) => p.tour ?? p.check)
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
});

describe('failure cases', () => {
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
