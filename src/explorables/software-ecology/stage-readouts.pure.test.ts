import { describe, expect, it } from 'vitest';
import { DTW } from './factory-dials.pure.ts';
import { applySet, scenarioStart } from './factory-scenario.pure.ts';
import { step } from './factory-step.pure.ts';
import { customerOf, relativeOf, stationOf, statusOf, verdictOf } from './stage-readouts.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const SEED = 20261111;
const at = (preset: string) => {
  const B = builtinBundle('tire'),
    p = B.data.presets.find((x) => x.id === preset)!;
  return scenarioStart(B, p, SEED);
};
const run = (m: ReturnType<typeof at>, weeks: number) => {
  for (let i = 0, n = Math.round(weeks / DTW); i < n; i++) step(m);
};

describe('success cases', () => {
  it('reads Ideal after its warm-up as calm: nothing piles up and no dial moved', () => {
    // ARRANGE
    const m = at('ideal');
    const calm = { kind: 'calm' };
    // ACT
    const status = statusOf(m, { s: m.s, warming: false, dropped: 0 });
    // ASSERT
    expect(status).toEqual(calm);
  });

  it('names quality assurance first when AI at the engineer floods it (AI unbalanced, week 8)', () => {
    // ARRANGE
    const m = at('ai-unbalanced');
    applySet({ ai: ['eng'], dials: { eng: { aiExtra: 2 } } }, m, m.s);
    run(m, 8);
    const first = 'qa';
    // ACT
    const status = statusOf(m, { s: m.s, warming: false, dropped: 0 });
    // ASSERT
    expect(status.kind === 'busy' && status.hot[0]).toMatchObject({ id: first, red: true });
  });

  it('marks quality assurance as piling and the engineer as AI at the same step', () => {
    // ARRANGE
    const m = at('ai-unbalanced');
    applySet({ ai: ['eng'], dials: { eng: { aiExtra: 2 } } }, m, m.s);
    run(m, 8);
    // ACT
    const qa = stationOf(m.nodes.get('qa')!, { m, s: m.s });
    const eng = stationOf(m.nodes.get('eng')!, { m, s: m.s });
    // ASSERT
    expect([qa.piling, eng.ai, qa.ai]).toEqual([true, true, false]);
  });
});

describe('failure cases', () => {
  it('reads a warming factory as warming, whatever its state', () => {
    // ARRANGE
    const m = at('realistic');
    const warming = { kind: 'warming' };
    // ACT
    const status = statusOf(m, { s: m.s, warming: true, dropped: 0 });
    // ASSERT
    expect(status).toEqual(warming);
  });

  it('calls output a third of Ideal below 0.4 and more output with an unhappier customer above 1.15 at 70 %', () => {
    // ARRANGE
    const third = { kind: 'third' },
      verdict = 'moreUnhappier';
    // ACT
    const rel = relativeOf(0.35),
      v = verdictOf(1.5, 0.7);
    // ASSERT
    expect([rel, v]).toEqual([third, verdict]);
  });
});

describe('edge cases', () => {
  it('shows twelve empty release cells, full satisfaction and no lead time on a cleared factory at day 0', () => {
    // ARRANGE
    const m = at('bug-spiral');
    const empty = Array.from({ length: 12 }, () => null);
    // ACT
    const c = customerOf(m, m.s);
    // ASSERT
    expect([c.releases, c.sat, c.leadDays]).toEqual([empty, 1, null]);
  });
});
