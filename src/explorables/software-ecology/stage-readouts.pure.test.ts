import { describe, expect, it } from 'vitest';
import { SHELF } from './factory-flow.pure.ts';
import type { FactoryHandle } from './factory-model.pure.ts';
import { scenarioStart, settingsAfter } from './factory-scenario.pure.ts';
import { relativeOf, verdictOf } from './stage-readouts.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const SEED = 20261111;
const at = (preset: string) => {
  const B = builtinBundle('tire'),
    p = B.data.presets.find((x) => x.id === preset)!;
  return scenarioStart(B, p, SEED);
};
/** AI at the engineer writing twice the work, eight weeks on: AI unbalanced's step 2. */
const flooded = (): FactoryHandle => {
  const f = at('ai-unbalanced');
  f.set(settingsAfter({ ai: ['eng'], dials: { eng: { aiExtra: 2 } } }, builtinBundle('tire'), f.settings));
  f.step(8);
  return f;
};

describe('success cases', () => {
  it('reads Ideal after its warm-up as calm: nothing piles up and no dial moved', () => {
    // ARRANGE
    const m = at('ideal');
    const calm = { kind: 'calm' };
    // ACT
    const status = m.read().status;
    // ASSERT
    expect(status).toEqual(calm);
  });

  it('names quality assurance first when AI at the engineer floods it (AI unbalanced, week 8)', () => {
    // ARRANGE
    const m = flooded();
    const first = 'qa';
    // ACT
    const status = m.read().status;
    // ASSERT
    expect(status.kind === 'busy' && status.hot[0]).toMatchObject({ id: first, red: true });
  });

  it('marks quality assurance as piling and the engineer as AI at the same step', () => {
    // ARRANGE
    const m = flooded();
    // ACT
    const { qa, eng } = m.read().stations;
    if (!qa || !eng) throw new Error('no qa or eng');
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
    const status = m.read({ warming: { day: 1, of: 300 } }).status;
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
    const empty = Array.from({ length: SHELF }, () => null);
    // ACT
    const c = m.read().customer;
    // ASSERT
    expect([c.releases, c.sat, c.leadDays]).toEqual([empty, 1, null]);
  });
});
