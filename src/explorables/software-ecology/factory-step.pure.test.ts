import { describe, expect, it } from 'vitest';
import { startSettings } from './factory-dials.pure.ts';
import { createFactory, type FactoryHandle } from './factory-model.pure.ts';
import { withCompany, withOwn } from './factory-settings.pure.ts';
import type { Bundle, Settings } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

/*
 * Own work (design-ADR 0024 §2, §17; feedback 10, grill Q171–Q177): nodes with a `source` in the file write tickets of
 * their own under Product company, at the rate and arrivals the file or the node's dashboard sets.
 */
const B: Bundle = builtinBundle('tire');
const SEED = 7;
const WEEKS = 40;
const realistic = (): Settings => startSettings(B, B.data.presets.find((p) => p.id === 'realistic') as never);
const product = (): Settings => ({ ...realistic(), company: 'product' });
const SOURCE_NODES = (B.data.sources ?? []).map((x) => x.at);

/** Runs `weeks` and counts the own tickets that arrived, by work center. */
const arrivalsOf = (s: Settings, weeks = WEEKS): Record<string, number> => {
  const f = createFactory(B, s, SEED),
    seen: Record<string, number> = {};
  f.listen((what, n) => {
    if (what === 'own' && n) seen[n.node.id] = (seen[n.node.id] ?? 0) + 1;
  });
  f.step(weeks);
  return seen;
};

const customerRequests = (s: Settings): number => {
  const f = createFactory(B, s, SEED);
  let n = 0;
  f.listen((what) => {
    if (what === 'request') n++;
  });
  f.step(WEEKS);
  return n;
};

describe('success cases', () => {
  it('writes own tickets only at the work centers the file gives a source', () => {
    // ARRANGE
    const s = product();
    // ACT
    const seen = arrivalsOf(s);
    // ASSERT
    expect(Object.keys(seen).sort()).toEqual([...new Set(SOURCE_NODES)].sort());
  });

  it('marks the waiting own tickets with the lightbulb through the floor', () => {
    // ARRANGE
    const weeks = 20;
    const f = createFactory(B, product(), SEED);
    f.step(weeks);
    // ACT
    const marks = f.floor.stations.flatMap((st) =>
      Array.from({ length: st.queue.n }, (_, i) => st.queue.at(i)).map((r) => ({ id: st.node.id, own: r.own })),
    );
    // ASSERT
    expect(marks.filter((x) => x.own && SOURCE_NODES.includes(x.id)).length).toBeGreaterThan(0);
  });

  it('changes the arrivals when the rate changes, and stops them at zero', () => {
    // ARRANGE
    const tripled = 3;
    const base = product();
    const more = withOwn(base, 'roadmap', { rate: 12 });
    const none = withOwn(base, 'roadmap', { rate: 0 });
    // ACT
    const [a, b, c] = [base, more, none].map((s) => arrivalsOf(s)['pm'] ?? 0) as [number, number, number];
    // ASSERT
    expect(b).toBeGreaterThan(a * tripled);
    expect(c).toBe(0);
  });

  it('takes the file’s rate where the dashboard sets none', () => {
    // ARRANGE
    const fileRate = 2;
    const roadmap = 'roadmap';
    const random = 'random';
    const f: FactoryHandle = createFactory(B, product(), SEED);
    // ACT
    const own = f.read({ watch: ['pm'] }).dashboards['pm']?.own;
    // ASSERT
    const same = { rate: fileRate, arrivals: random };
    expect(own).toEqual([{ id: roadmap, now: same, file: same }]);
  });

  it('keeps the Customer’s request stream the same when every own-work source switches to Steady', () => {
    // ARRANGE
    const base = product();
    const ids = ['roadmap', 'leads', 'debt'];
    const steady = ids.reduce((s, id) => withOwn(s, id, { arrivals: 'steady' }), base);
    // ACT
    const [a, b] = [base, steady].map((s) => customerRequests(s));
    // ASSERT
    expect(b).toBe(a);
  });

  it('draws Steady arrivals evenly: one every 1/rate weeks', () => {
    // ARRANGE
    const perWeek = 2;
    const s = withOwn(product(), 'roadmap', { arrivals: 'steady', rate: perWeek });
    // ACT
    const n = arrivalsOf(s)['pm'] ?? 0;
    // ASSERT
    expect(n).toBe(perWeek * WEEKS);
  });
});

describe('failure cases', () => {
  it('writes no own work under Service provider, and again under Product company at the rates the visitor set', () => {
    // ARRANGE
    const rate = 5;
    const half = WEEKS / 2;
    const set = withOwn(product(), 'roadmap', { rate });
    const service = withCompany(set, 'service');
    // ACT
    const off = arrivalsOf(service);
    const back = arrivalsOf(withCompany(service, 'product'));
    const own = createFactory(B, service, SEED).read({ watch: ['pm'] }).dashboards['pm']?.own;
    // ASSERT
    expect(off).toEqual({});
    expect(back['pm']).toBeGreaterThan(rate * half);
    expect(own).toEqual([]);
  });
});

describe('edge cases', () => {
  it('draws a Steady rate under one a week as one every 1/rate weeks', () => {
    // ARRANGE
    const perWeek = 0.5;
    const s = withOwn(product(), 'roadmap', { arrivals: 'steady', rate: perWeek });
    // ACT
    const n = arrivalsOf(s)['pm'] ?? 0;
    // ASSERT
    expect(n).toBe(perWeek * WEEKS);
  });
});
