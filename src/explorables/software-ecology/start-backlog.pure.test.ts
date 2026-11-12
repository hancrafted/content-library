import { describe, expect, it } from 'vitest';
import { FactoryRun, presetOf } from './factory-run.pure.ts';
import { playSteps, scenarioStart } from './factory-scenario.pure.ts';
import type { Preset, StepSet } from './software-ecology.types';
import { displayOf, startBacklogOf } from './start-backlog.pure.ts';
import { defaultsOf } from './state-defaults.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const tire = builtinBundle('tire');
const FULL = 100,
  HALF = 50;
const measuresOf = (f: { read: (o: { measures: string[] }) => { measures: unknown } }, keys: string[]) =>
  f.read({ measures: keys }).measures as Record<string, number>;
const backlogOf = (f: Parameters<typeof measuresOf>[0], id: string): number =>
  measuresOf(f, [`${id}.backlog`])[`${id}.backlog`] as number;

/** Where the work waits longest `weeks` after Realistic's loaded start, once `set` is applied. */
const afterSet = (set: StepSet, weeks: number): { before: number; qa: number; worst: string } => {
  const f = scenarioStart(tire, presetOf(tire, 'realistic')),
    ids = tire.data.centers.map((c) => c.id);
  const waits = () =>
    measuresOf(
      f,
      ids.map((i) => `${i}.weeksWaiting`),
    );
  const before = waits()['qa.weeksWaiting'] as number;
  Array.from(playSteps(f, tire, [{ set, run: weeks }]));
  const after = waits();
  const wait = (id: string) => after[`${id}.weeksWaiting`] as number;
  const worst = [...ids].sort((a, b) => wait(b) - wait(a))[0] as string;
  return { before, qa: wait('qa'), worst };
};

describe('success cases', () => {
  it('seeds Tire swing Realistic with QA 3, Engineering 2 and Analysis 2 weeks of work', () => {
    // ARRANGE
    const expected = { qa: 3, eng: 2, ba: 2 };
    // ACT
    const weeks = startBacklogOf(tire, presetOf(tire, 'realistic'), FULL);
    // ASSERT
    expect(weeks).toEqual(expected);
  });

  it('seeds the Lead at Gatekeeper lead and the shared Platform at Two teams', () => {
    // ARRANGE
    const gate = builtinBundle('gate'),
      teams = builtinBundle('teams'),
      lead = { lrev: 3 },
      platform = { plat: 3 };
    // ACT
    const seenLead = startBacklogOf(gate, presetOf(gate, 'realistic'), FULL),
      seenPlat = startBacklogOf(teams, presetOf(teams, 'realistic'), FULL);
    // ASSERT
    expect(seenLead).toEqual(lead);
    expect(seenPlat).toEqual(platform);
  });

  it('starts Realistic with the piles on show at week 0 of the run, and Ideal without', () => {
    // ARRANGE
    const realistic = new FactoryRun({ B: tire, preset: 'realistic', now: true }),
      ideal = new FactoryRun({ B: tire, preset: 'ideal', now: true });
    const pile = 40,
      weeksWaiting = 1;
    // ACT
    const qa = backlogOf(realistic, 'qa'),
      qaIdeal = backlogOf(ideal, 'qa');
    const waiting = measuresOf(realistic, ['qa.weeksWaiting'])['qa.weeksWaiting'] as number;
    // ASSERT
    expect(qa).toBeGreaterThan(qaIdeal + pile);
    expect(waiting).toBeGreaterThan(weeksWaiting);
  });

  it('lets the seeded piles drain: the model stays stable', () => {
    // ARRANGE
    const f = scenarioStart(tire, presetOf(tire, 'realistic'));
    const full = backlogOf(f, 'qa'),
      weeks = 40,
      third = 3;
    // ACT
    f.step(weeks);
    // ASSERT
    expect(backlogOf(f, 'qa')).toBeLessThan(full / third);
  });

  it.each([
    ['AI at quality assurance', { ai: ['qa'] }, 2],
    ['quality assurance at twice the efficiency', { dials: { qa: { efficiency: 200 } } }, 3],
  ] as const)('clears the bottleneck pile with %s and moves the largest backlog downstream', (_name, set, weeks) => {
    // ARRANGE
    const downstream = 'ops',
      pile = 2,
      cleared = 0.5;
    // ACT
    const seen = afterSet(set, weeks);
    // ASSERT
    expect(seen.before).toBeGreaterThan(pile);
    expect(seen.qa).toBeLessThan(cleared);
    expect(seen.worst).toBe(downstream);
  });
});

describe('failure cases', () => {
  it('seeds nothing on a state that starts clear, or at Ideal', () => {
    // ARRANGE
    const spiral = presetOf(tire, 'bug-spiral'),
      none = {};
    // ACT
    const clear = startBacklogOf(tire, spiral, FULL),
      ideal = startBacklogOf(tire, presetOf(tire, 'ideal'));
    // ASSERT
    expect(clear).toEqual(none);
    expect(ideal).toEqual(none);
  });
});

describe('edge cases', () => {
  it('scales the piles by reality between Ideal and Realistic, and lets a state carry its own', () => {
    // ARRANGE
    const own: Preset = { id: 'x', reality: HALF, backlog: { qa: 4 } };
    const scaled = { qa: 1.5, eng: 1, ba: 1 },
      carried = { qa: 2 };
    // ACT
    const half = startBacklogOf(tire, { id: 'y', reality: HALF }),
      theirs = startBacklogOf(tire, own);
    // ASSERT
    expect(half).toEqual(scaled);
    expect(theirs).toEqual(carried);
  });

  it('defines every setting in the file: Reset to default reads the state its file defines', () => {
    // ARRANGE
    const B = {
      ...tire,
      data: {
        ...tire.data,
        display: { pile: 'stack' as const, beltMotion: true },
        presets: tire.data.presets.map((p) =>
          p.id === 'speed-up' ? { ...p, display: { pile: 'drift' as const }, speed: 5 } : p,
        ),
      },
    };
    const page = { speed: 1, beltMotion: true, pile: 'stack', s: { preset: 'realistic', reality: FULL } };
    const fast = { speed: 5, beltMotion: true, pile: 'drift' },
      plain = { pile: 'heap', beltMotion: false };
    // ACT
    const real = defaultsOf(B, 'realistic'),
      faster = defaultsOf(B, 'speed-up'),
      roles = defaultsOf(B, 'roles');
    // ASSERT
    expect(real).toMatchObject(page);
    expect(faster).toMatchObject(fast);
    expect(roles.s.reality).toBe(0);
    expect(displayOf(tire, presetOf(tire, 'ideal'))).toEqual(plain);
  });
});
