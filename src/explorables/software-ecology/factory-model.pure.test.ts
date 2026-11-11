import { describe, expect, it } from 'vitest';
import { realisticSettings, startSettings } from './factory-dials.pure.ts';
import { buildFactory, createFactory } from './factory-model.pure.ts';
import { conservation, stateHash, weeksOfWork } from './factory-readouts.pure.ts';
import { applySet } from './factory-scenario.pure.ts';
import { RHO_BN, RHO_OTHER, stability } from './factory-sizing.pure.ts';
import { solve } from './factory-solve.pure.ts';
import type { Factory, FactoryNode, Hook } from './factory.types';
import type { Bundle, Settings } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

/*
 * Characterisation of the factory model (design-ADR 0024 §12). Expected values are the reference build's own, from
 * its headless run (docs/episodes/software-ecology/prototype/source/checks7c.out.txt, model checks 92–134).
 */
const settingsOf = (B: Bundle, preset: string): Settings =>
  startSettings(B, B.data.presets.find((p) => p.id === preset) as Bundle['data']['presets'][number]);

const realistic = (seed?: number) => {
  const B = builtinBundle('tire');
  return createFactory(B, { s: settingsOf(B, 'realistic'), seed });
};

/** A preset's settings with every `set` of its tour folded in: the scenario's end state. */
const endState = (B: Bundle, preset: string): Settings => {
  const p = B.data.presets.find((x) => x.id === preset) as Bundle['data']['presets'][number],
    s = startSettings(B, p);
  for (const st of p.tour ?? []) applySet(st.set, { B }, s);
  return s;
};

/** The work center with the most weeks of work waiting, and how many. */
const worst = (m: Factory): { id: string; weeks: string } => {
  const n = m.centers.reduce((a: FactoryNode, x) => (weeksOfWork(x, m.s) > weeksOfWork(a, m.s) ? x : a));
  return { id: n.id, weeks: weeksOfWork(n, m.s).toFixed(1) };
};

describe('success cases', () => {
  it('gives the same state for the same seed, and the reference build’s hashes after 100 weeks of tire Realistic', () => {
    // ARRANGE
    const weeks = 100;
    const expected = ['3e925c92', '3e925c92', '2cecdd05'];
    // ACT
    const hashes = [42, 42, 43].map((seed) => {
      const f = realistic(seed);
      f.step(weeks);
      return stateHash(f.model);
    });
    // ASSERT
    expect(hashes).toEqual(expected);
  });

  it('conserves every document across mid-run dial changes, as counted by the reference build', () => {
    // ARRANGE
    const f = realistic();
    const s = f.model.s;
    const expected = [
      { created: 1951, consumed: 1928, backlog: 13, transit: 4, work: 6, gap: 0 },
      { created: 2585, consumed: 2555, backlog: 26, transit: 1, work: 3, gap: 0 },
      { created: 3790, consumed: 3742, backlog: 40, transit: 5, work: 3, gap: 0 },
    ];
    // ACT
    f.step(20);
    const a = conservation(f.model);
    f.set({
      ...s,
      ai: 'all',
      over: { eng: { eff: 1000 }, qa: { eff: 25 } },
      cust: {
        ...(s.cust as NonNullable<Settings['cust']>),
        rate: 14,
        mode: 'random',
        mix: { sales: 10, pm: 10, support: 80 },
      },
    });
    f.step(7.37);
    const b = conservation(f.model);
    f.set({ ...f.model.s, reality: 0, mech: { rework: false, churn: true, complaints: false } });
    f.step(13.1);
    const c = conservation(f.model);
    // ASSERT
    expect([a, b, c]).toEqual(expected);
  });

  it('sizes tire for Realistic: the bottleneck at most 85 % busy, every other center at most 70 %', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const m = buildFactory(B, { s: { ...settingsOf(B, 'realistic'), company: 'service' } });
    const bottleneck = RHO_BN + 1e-6;
    const others = RHO_OTHER + 1e-6;
    // ACT
    const rho = solve(m, realisticSettings(B, 'service')).rho;
    const rest = Math.max(
      ...Object.entries(rho)
        .filter(([id]) => id !== 'eng')
        .map(([, v]) => v),
    );
    // ASSERT
    expect(rho.eng).toBeLessThanOrEqual(bottleneck);
    expect(rest).toBeLessThanOrEqual(others);
  });

  it('moves the bottleneck downstream when tire AI unbalanced raises quality assurance to 1000 %', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const f = createFactory(B, { s: endState(B, 'ai-unbalanced') });
    const expected = { before: { id: 'qa', weeks: '16.8' }, after: { id: 'ops', weeks: '36.5' }, qa: '0.0' };
    // ACT
    f.step(30);
    const before = worst(f.model);
    f.step(10);
    f.set({ ...f.model.s, over: { ...f.model.s.over, qa: { ...f.model.s.over.qa, eff: 1000 } } });
    f.step(30);
    const after = worst(f.model);
    const qa = weeksOfWork(f.model.nodes.get('qa') as FactoryNode, f.model.s).toFixed(1);
    // ASSERT
    expect({ before, after, qa }).toEqual(expected);
  });

  it('drains a congestion within a week once the dials go back to Ideal (two teams, AI at both engineering teams)', () => {
    // ARRANGE
    const B = builtinBundle('teams');
    const f = createFactory(B, { s: endState(B, 'realistic') });
    const ideal = startSettings(B, B.data.presets.find((p) => p.id === 'ideal') as Bundle['data']['presets'][number]);
    const upstream = { anA: { eff: 200 }, engB: { eff: 200 }, pm: { eff: 200 }, support: { eff: 200 } };
    const expected = { peak: { id: 'plat', weeks: '1.8' }, weeksToDrain: 1 };
    // ACT
    f.step(60);
    f.set({ ...f.model.s, ai: ['engA', 'engB'], over: upstream });
    f.step(15);
    const peak = worst(f.model);
    f.set({
      ...f.model.s,
      preset: ideal.preset,
      reality: ideal.reality,
      ai: ideal.ai,
      over: ideal.over,
      cust: ideal.cust,
    });
    let weeksToDrain = 0;
    const most = () => Math.max(...f.model.centers.map((n) => weeksOfWork(n, f.model.s)));
    while (most() > 1 && weeksToDrain < 400) {
      f.step(1);
      weeksToDrain++;
    }
    // ASSERT
    expect({ peak, weeksToDrain }).toEqual(expected);
  });

  it('accepts every shipped use case as a product and a service company', () => {
    // ARRANGE
    const none: string[] = [];
    // ACT
    const refused = ['tire', 'gate', 'teams'].flatMap((id) =>
      (['service', 'product'] as const).flatMap((company) => {
        const B = builtinBundle(id);
        return stability(buildFactory(B, { s: { ...settingsOf(B, 'ideal'), company } })).refuse;
      }),
    );
    // ASSERT
    expect(refused).toEqual(none);
  });
});

describe('failure cases', () => {
  it('refuses a use case whose Realistic dials would need more than 1.5× a center’s Ideal capacity', () => {
    // ARRANGE
    const tire = builtinBundle('tire');
    const B: Bundle = {
      ...tire,
      data: {
        ...tire.data,
        centers: tire.data.centers.map((c) => (c.id === 'support' ? { ...c, realistic: [60, 95] as const } : c)),
      },
    };
    const expected = ['support: Realistic needs 2.11× its Ideal capacity (at most 1.5×)'];
    // ACT
    const m = buildFactory(B, { s: { ...settingsOf(B, 'ideal'), company: 'service' } });
    const refused = stability(m).refuse.filter((t) => t.includes('Ideal capacity'));
    // ASSERT
    expect(refused).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('starts empty at day 0', () => {
    // ARRANGE
    const expected = { created: 0, consumed: 0, backlog: 0, transit: 0, work: 0, gap: 0 };
    // ACT
    const c = conservation(realistic().model);
    // ASSERT
    expect(c).toEqual(expected);
  });

  it('takes a quarter working day for every handoff, whatever the belt', () => {
    // ARRANGE
    const belts = 12;
    const quarterDay = [0.05];
    // ACT
    const m = realistic().model;
    const times = [...new Set(m.edges.map((e) => e.T))];
    // ASSERT
    expect(m.edges).toHaveLength(belts);
    expect(times).toEqual(quarterDay);
  });

  it('keeps the Customer’s requests when rework is switched off: separate streams', () => {
    // ARRANGE
    const weeks = 20;
    const run = (rework: boolean) => {
      const f = realistic(9);
      const seen: string[] = [];
      const hook: Hook = (what, _n, at) => {
        if (what === 'request') seen.push(`${at?.e.i}@${(at?.x as number).toFixed(6)}`);
      };
      f.model.hook = hook;
      f.set({ ...f.model.s, mech: { ...f.model.s.mech, rework } });
      f.step(weeks);
      return { seen: seen.join(','), hash: stateHash(f.model) };
    };
    // ACT
    const on = run(true);
    const off = run(false);
    // ASSERT
    expect(off.seen).toBe(on.seen);
    expect(off.hash).not.toBe(on.hash);
  });
});
