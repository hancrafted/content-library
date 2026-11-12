import { describe, expect, it } from 'vitest';
import { displayOf } from './display-defaults.pure.ts';
import { FactoryRun, presetOf } from './factory-run.pure.ts';
import { playSteps, scenarioStart } from './factory-scenario.pure.ts';
import type { Bundle, Preset, StepSet } from './software-ecology.types';
import { startBacklogOf } from './start-backlog.pure.ts';
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
const afterSet = (x: {
  B: Bundle;
  at: string;
  set: StepSet;
  weeks: number;
}): { before: number; after: number; worst: string } => {
  const { B, at, set, weeks } = x;
  const f = scenarioStart(B, presetOf(B, 'realistic')),
    ids = B.data.centers.map((c) => c.id);
  const waits = () =>
    measuresOf(
      f,
      ids.map((i) => `${i}.weeksWaiting`),
    );
  const before = waits()[`${at}.weeksWaiting`] as number;
  Array.from(playSteps(f, B, [{ set, run: weeks }]));
  const seen = waits();
  const wait = (id: string) => seen[`${id}.weeksWaiting`] as number;
  const worst = [...ids].sort((a, b) => wait(b) - wait(a))[0] as string;
  return { before, after: wait(at), worst };
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
    const surplus = qa - qaIdeal;
    // ASSERT
    expect(surplus).toBeGreaterThan(pile);
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
    const drained = backlogOf(f, 'qa'),
      limit = full / third;
    // ASSERT
    expect(drained).toBeLessThan(limit);
  });

  it.each([
    { name: 'Tire swing: AI at quality assurance', id: 'tire', at: 'qa', set: { ai: ['qa'] }, weeks: 2, next: 'ops' },
    {
      name: 'Gatekeeper lead: AI at the lead reviewer',
      id: 'gate',
      at: 'lrev',
      set: { ai: ['lrev'] },
      weeks: 2,
      next: 'ops',
    },
    {
      name: 'Gatekeeper lead: the lead reviewer at twice the efficiency',
      id: 'gate',
      at: 'lrev',
      set: { dials: { lrev: { efficiency: 200 } } },
      weeks: 3,
      next: 'ops',
    },
  ] as const)('clears the bottleneck pile with $name and moves the largest backlog downstream', (c) => {
    // ARRANGE
    const B = builtinBundle(c.id),
      pile = 2,
      cleared = 0.5;
    // ACT
    const seen = afterSet({ B, at: c.at, set: c.set as StepSet, weeks: c.weeks });
    // ASSERT
    expect(seen.before).toBeGreaterThan(pile);
    expect(seen.after).toBeLessThan(cleared);
    expect(seen.worst).toBe(c.next);
  });

  it('at Tire swing, clears quality assurance at twice the efficiency, and its flood’s bugs come back to Engineering', () => {
    // ARRANGE: the releases it lets through bring bugs to Support, which passes them on under pressure (grill 11 Q220)
    const B = builtinBundle('tire'),
      weeks = 3,
      pile = 2,
      cleared = 0.5,
      engineering = 'eng';
    // ACT
    const seen = afterSet({ B, at: 'qa', set: { dials: { qa: { efficiency: 200 } } }, weeks });
    // ASSERT
    expect(seen.before).toBeGreaterThan(pile);
    expect(seen.after).toBeLessThan(cleared);
    expect(seen.worst).toBe(engineering);
  });

  it.each([
    { name: 'AI at the platform', set: { ai: ['plat'] } },
    { name: 'the platform at twice the efficiency', set: { dials: { plat: { efficiency: 200 } } } },
  ] as const)('at Two teams, clears the shared platform with $name and moves the largest backlog off it', (c) => {
    // ARRANGE: the platform is the last work center, so downstream is the Customer, who holds no backlog
    const B = builtinBundle('teams'),
      weeks = 3,
      pile = 2,
      cleared = 0.5,
      platform = 'plat';
    // ACT
    const seen = afterSet({ B, at: platform, set: c.set as StepSet, weeks });
    // ASSERT
    expect(seen.before).toBeGreaterThan(pile);
    expect(seen.after).toBeLessThan(cleared);
    expect(seen.worst).not.toBe(platform);
  });
});

describe('failure cases', () => {
  it('seeds nothing on a state that starts clear, or at Ideal', () => {
    // ARRANGE
    const spiral: Preset = { id: 'spiral', reality: FULL, start: 'clear' },
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
        presets: [
          ...tire.data.presets,
          { id: 'faster', view: 'factory' as const, reality: FULL, display: { pile: 'drift' as const }, speed: 5 },
        ],
      },
    };
    const page = { speed: 1, beltMotion: true, pile: 'stack', s: { preset: 'realistic', reality: FULL } };
    const fast = { speed: 5, beltMotion: true, pile: 'drift' },
      plain = { pile: 'heap', beltMotion: false };
    // ACT
    const real = defaultsOf(B, 'realistic'),
      faster = defaultsOf(B, 'faster'),
      roles = defaultsOf(B, 'roles');
    const idealDisplay = displayOf(tire, presetOf(tire, 'ideal')),
      rolesReality = roles.s.reality,
      noReality = 0;
    // ASSERT
    expect(real).toMatchObject(page);
    expect(faster).toMatchObject(fast);
    expect(rolesReality).toBe(noReality);
    expect(idealDisplay).toEqual(plain);
  });
});
