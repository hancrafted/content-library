// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { RHO_IDEAL, RUSH_TO } from './factory-dials.pure.ts';
import { solve, type SolveResult } from './factory-solve.pure.ts';
import type { Factory, FactoryNode } from './factory.types';
import type { Settings } from './software-ecology.types';
import { idealSettings, realisticSettings } from './start-settings.pure.ts';

export const RHO_REAL = 0.9;
export const RHO_BN = 0.85;
export const RHO_OTHER = 0.7;
export const SIZE_MAX = 1.5;

interface Need {
  readonly w: number;
  readonly wr: number;
}

const apply = (n: FactoryNode, need: Need, rho: number): void => {
  n.muIdeal = Math.max(0.05, need.w / RHO_IDEAL);
  n.muQ93 = Math.max(n.muIdeal, need.wr / RHO_REAL);
  n.mu = Math.max(n.muIdeal, need.wr / rho);
};

const rhoFor = (m: Factory): ((n: FactoryNode) => number) => {
  const bn = m.nodes.get(m.B.data.bottleneck ?? ''),
    bp = bn?.def.person;
  return (n) => (n === bn || (bp && n.def.person === bp) ? RHO_BN : RHO_OTHER);
};

const perPerson = (m: Factory, need: (n: FactoryNode) => Need): Record<string, Need> => {
  const per: Record<string, Need> = {};
  for (const n of m.centers) {
    const p = n.def.person;
    if (!p) continue;
    const x = need(n),
      was = per[p] ?? { w: 0, wr: 0 };
    per[p] = { w: was.w + x.w, wr: was.wr + x.wr };
  }
  return per;
};

export const size = (m: Factory): void => {
  const rhoAt = rhoFor(m);
  for (const n of m.centers) n.mu = 1;
  const r = solve(m, idealSettings(m.s.company)),
    rr = solve(m, realisticSettings(m.B, m.s.company));
  const need = (n: FactoryNode): Need => ({ w: r.load[n.idx], wr: rr.rho[n.id] });
  const per = perPerson(m, need);
  for (const n of m.centers) {
    n.idealJobs = r.jobs[n.idx];
    apply(n, n.def.person ? per[n.def.person] : need(n), rhoAt(n));
  }
  m.idealOut = r.out;
  m.idealOwn = r.own;
  m.idealReq = r.req;
};

export interface Stability {
  readonly refuse: string[];
  readonly warn: string[];
  readonly nominal: SolveResult;
  readonly rush: SolveResult;
  readonly worst: SolveResult;
}

const oversized = (m: Factory): string[] => {
  const out: string[] = [],
    seen = new Set<string>();
  for (const n of m.centers) {
    const p = n.def.person,
      k = p ? `person ${p}` : n.id;
    if (seen.has(k)) continue;
    seen.add(k);
    const x = n.muQ93 / n.muIdeal;
    if (x > SIZE_MAX + 1e-9)
      out.push(`${k}: Realistic needs ${x.toFixed(2)}× its Ideal capacity (at most ${SIZE_MAX}×)`);
  }
  return out;
};

const TAILS = {
  nominal: '',
  rush: ` when every center rushes (${RUSH_TO}+ weeks of work waiting)`,
  worst: ' when every center rushes and every inspection passes bad work unread',
} as const;

const overloads = (m: Factory, r: SolveResult, tail: string): string[] => {
  const settles = r.converged && r.gain < 1;
  return [
    ...(settles
      ? []
      : [`customer: the follow-up requests never settle (${r.gain.toFixed(2)} new requests per request)${tail}`]),
    ...m.centers
      .filter((n) => !n.def.person && !(r.rho[n.id] < 1))
      .map((n) => `${n.id}: load ${r.rho[n.id].toFixed(2)} of capacity at Realistic${tail}`),
    ...Object.entries(r.persons)
      .filter(([, v]) => !(v < 1))
      .map(([p, v]) => `person ${p}: load ${v.toFixed(2)} of capacity at Realistic${tail}`),
  ];
};

export const stability = (m: Factory, s: Settings = realisticSettings(m.B, m.s.company)): Stability => {
  const nominal = solve(m, s, { worst: false, rush: false }),
    rush = solve(m, s, { worst: false, rush: true }),
    worst = solve(m, s, { worst: true, rush: true });
  return {
    refuse: [...oversized(m), ...overloads(m, nominal, TAILS.nominal)],
    warn: [...overloads(m, rush, TAILS.rush), ...overloads(m, worst, TAILS.worst)],
    nominal,
    rush,
    worst,
  };
};
