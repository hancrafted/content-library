import { describe, expect, it } from 'vitest';
import { realisticSettings, startSettings } from './factory-dials.pure.ts';
import { buildFactory, createFactory, type Audit, type FactoryHandle } from './factory-model.pure.ts';
import { RHO_BN, RHO_OTHER, stability } from './factory-sizing.pure.ts';
import { solve } from './factory-solve.pure.ts';
import { applySet } from './scenario-set.pure.ts';
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
  return createFactory(B, settingsOf(B, 'realistic'), seed);
};

/** Conservation as a read of the handle gives it, without the hash. */
const conservation = (f: FactoryHandle): Omit<Audit, 'hash'> => {
  const a = f.read({ audit: true }).audit as Audit;
  return { created: a.created, consumed: a.consumed, backlog: a.backlog, transit: a.transit, work: a.work, gap: a.gap };
};
const stateHash = (f: FactoryHandle): string => (f.read({ audit: true }).audit as Audit).hash;

/** A preset's settings with every `set` of its tour folded in: the scenario's end state. */
const endState = (B: Bundle, preset: string): Settings => {
  const p = B.data.presets.find((x) => x.id === preset) as Bundle['data']['presets'][number],
    s = startSettings(B, p);
  for (const st of p.tour ?? []) applySet(st.set, { B }, s);
  return s;
};

/** The work center with the most weeks of work waiting, and how many. */
const worst = (f: FactoryHandle): { id: string; weeks: string } => {
  const n = Object.values(f.read().stations).reduce((a, x) => (x.weeks > a.weeks ? x : a));
  return { id: n.id, weeks: n.weeks.toFixed(1) };
};

describe('success cases', () => {
  it('gives the same state for the same seed, and the reference build’s hashes after 100 weeks of tire Realistic', () => {
    // ARRANGE
    const weeks = 100;
    const expected = ['173452ef', '173452ef', '4415a63f'];
    // ACT
    const hashes = [42, 42, 43].map((seed) => {
      const f = realistic(seed);
      f.step(weeks);
      return stateHash(f);
    });
    // ASSERT
    expect(hashes).toEqual(expected);
  });

  it('conserves every document across mid-run dial changes, as counted by the reference build', () => {
    // ARRANGE
    const f = realistic();
    const s = f.settings;
    const expected = [
      { created: 1965, consumed: 1948, backlog: 6, transit: 6, work: 5, gap: 0 },
      { created: 2594, consumed: 2570, backlog: 18, transit: 3, work: 3, gap: 0 },
      { created: 3799, consumed: 3753, backlog: 38, transit: 5, work: 3, gap: 0 },
    ];
    // ACT
    f.step(20);
    const a = conservation(f);
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
    const b = conservation(f);
    f.set({ ...f.settings, reality: 0, mech: { rework: false, churn: true, complaints: false } });
    f.step(13.1);
    const c = conservation(f);
    // ASSERT
    expect([a, b, c]).toEqual(expected);
  });

  it('sizes tire for Realistic: the bottleneck at most 85 % busy, every other center at most 70 %', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const m = buildFactory(B, { ...settingsOf(B, 'realistic'), company: 'service' });
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

  it('moves the bottleneck downstream when tire in practice, AI at Engineering, raises quality assurance to 1000 %', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const f = createFactory(B, { ...endState(B, 'realistic'), ai: ['eng'], over: { eng: { aiExtra: 2 } } });
    const expected = { before: { id: 'qa', weeks: '16.9' }, after: { id: 'ops', weeks: '44.4' }, qa: '0.0' };
    // ACT
    f.step(30);
    const before = worst(f);
    f.step(10);
    f.set({ ...f.settings, over: { ...f.settings.over, qa: { ...f.settings.over.qa, eff: 1000 } } });
    f.step(30);
    const after = worst(f);
    const qa = f.read().stations.qa?.weeks.toFixed(1);
    // ASSERT
    expect({ before, after, qa }).toEqual(expected);
  });

  it('drains a congestion within a week once the dials go back to Ideal (two teams, AI at both engineering teams)', () => {
    // ARRANGE
    const B = builtinBundle('teams');
    const f = createFactory(B, endState(B, 'realistic'));
    const ideal = startSettings(B, B.data.presets.find((p) => p.id === 'ideal') as Bundle['data']['presets'][number]);
    const upstream = { anA: { eff: 200 }, engB: { eff: 200 }, pm: { eff: 200 }, support: { eff: 200 } };
    const expected = { peak: { id: 'plat', weeks: '1.8' }, weeksToDrain: 1 };
    // ACT
    f.step(60);
    f.set({ ...f.settings, ai: ['engA', 'engB'], over: upstream });
    f.step(15);
    const peak = worst(f);
    f.set({
      ...f.settings,
      preset: ideal.preset,
      reality: ideal.reality,
      ai: ideal.ai,
      over: ideal.over,
      cust: ideal.cust,
    });
    let weeksToDrain = 0;
    const most = () => Math.max(...Object.values(f.read().stations).map((n) => n.weeks));
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
        return createFactory(B, { ...settingsOf(B, 'ideal'), company }).check().refuse;
      }),
    );
    // ASSERT
    expect(refused).toEqual(none);
  });

  it('sends nothing back when the file sets mechanics.maxBounces to 0, and rework as before at its default', () => {
    // ARRANGE
    const tire = builtinBundle('tire');
    const none: Bundle = { ...tire, data: { ...tire.data, mechanics: { ...tire.data.mechanics, maxBounces: 0 } } };
    const read = (B: Bundle) => {
      const f = createFactory(B, settingsOf(B, 'realistic'));
      f.step(30);
      return f.read({ measures: ['eng.rework'] }).measures['eng.rework'];
    };
    // ACT
    const [atDefault, atZero] = [read(tire), read(none)];
    // ASSERT
    expect(atDefault).toBeGreaterThan(0);
    expect(atZero).toBe(0);
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
    const expected = ['support: Realistic needs 2.08× its Ideal capacity (at most 1.5×)'];
    // ACT
    const m = buildFactory(B, { ...settingsOf(B, 'ideal'), company: 'service' });
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
    const c = conservation(realistic());
    // ASSERT
    expect(c).toEqual(expected);
  });

  it('takes a quarter working day for every handoff, whatever the belt', () => {
    // ARRANGE
    const belts = 12;
    const quarterDay = [0.05];
    // ACT
    const m = buildFactory(builtinBundle('tire'), settingsOf(builtinBundle('tire'), 'realistic'));
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
      f.listen((what, _station, at) => {
        if (what === 'request') seen.push(`${at?.belt.i}@${(at?.x as number).toFixed(6)}`);
      });
      f.set({ ...f.settings, mech: { ...f.settings.mech, rework } });
      f.step(weeks);
      return { seen: seen.join(','), hash: stateHash(f) };
    };
    // ACT
    const on = run(true);
    const off = run(false);
    // ASSERT
    expect(off.seen).toBe(on.seen);
    expect(off.hash).not.toBe(on.hash);
  });
});
