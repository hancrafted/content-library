// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { DEFECTS, kindChancesOf } from './defect.pure.ts';
import { AMBER, dials, fileOwnOf, ownOf, productCo, RED, speedOf } from './factory-dials.pure.ts';
import type { Dials, Factory, FactoryNode } from './factory.types';
import type { OwnSet } from './own-work.types';
import type { Cust, Defect, Settings } from './software-ecology.types';
import { drainOf } from './stage-readouts.pure.ts';
import { custOf } from './start-settings.pure.ts';

export type Level = 'red' | 'amber' | 'green';
export type SignalKind = 'backing' | 'bottleneck' | 'overloaded' | 'rework' | 'unread' | 'starved' | 'ok';

export interface Signal {
  readonly kind: SignalKind;
  readonly level: Level;
  readonly n: number;
}

export interface TrendPaths {
  readonly line: string;
  readonly area: string;
  readonly ref: string;
}

export interface OwnReadout {
  readonly id: string;
  readonly now: Required<OwnSet>;
  readonly file: Required<OwnSet>;
}

export interface DashboardReadout {
  readonly id: string;
  readonly own: readonly OwnReadout[];
  readonly light: Level;
  readonly signals: readonly Signal[];
  readonly drain:
    | { readonly kind: 'grow'; readonly n: number }
    | { readonly kind: 'clears'; readonly weeks: number }
    | null;
  readonly out: { readonly now: number; readonly paths: TrendPaths };
  readonly good: { readonly now: number | null; readonly paths: TrendPaths };
  readonly wait: { readonly now: number; readonly level: number; readonly paths: TrendPaths };
  readonly dials: Dials;
  readonly util: { readonly busy: number; readonly blocked: number; readonly starved: number };
  readonly flows: {
    readonly done: number;
    readonly arriving: number;
    readonly capacity: number;
    readonly backlog: number;
    readonly lead: number | null;
  };
}

/** Blocked share above which a work center reads red. */
const BLOCKED = 0.2;
const REWORK_HEAVY = 0.2;
const STARVED = 0.6;
const UNREAD = 0.5;

type Check = (n: FactoryNode) => Signal | null;

const reworkShare = (n: FactoryNode) => (n.rate.arr > 0.05 ? n.rate.rwIn / n.rate.arr : 0);

const CHECKS: readonly Check[] = [
  (n) => (n.u.blocked > BLOCKED ? { kind: 'backing', level: 'red', n: 0 } : null),
  (n) => (n.lvl === 2 ? { kind: 'bottleneck', level: 'red', n: n.Ws } : null),
  (n) => (n.lvl === 1 ? { kind: 'overloaded', level: 'amber', n: n.Ws } : null),
  (n) =>
    reworkShare(n) > REWORK_HEAVY ? { kind: 'rework', level: 'amber', n: Math.round(reworkShare(n) * 100) } : null,
  (n) => (n.def.inspection && n.rate.unread >= UNREAD ? { kind: 'unread', level: 'amber', n: 0 } : null),
  (n) => (n.u.starved > STARVED ? { kind: 'starved', level: 'amber', n: 0 } : null),
];

export const signalsOf = (n: FactoryNode): { level: Level; list: Signal[] } => {
  const L = CHECKS.map((c) => c(n)).filter((x): x is Signal => x !== null);
  const level: Level = L.some((x) => x.level === 'red') ? 'red' : L.length ? 'amber' : 'green';
  return { level, list: L.length ? L : [{ kind: 'ok', level: 'green', n: 0 }] };
};

export const leadTimeOf = (n: FactoryNode): number | null => {
  const h = n.hist.L;
  if (h.length < 9) return null;
  const now = h[h.length - 1] as number,
    then = h[h.length - 9] as number,
    x = n.rate.done;
  if (x < 0.05 || Math.abs(now - then) > Math.max(1, 0.15 * Math.max(now, then))) return null;
  return now / x;
};

const drainFor = (n: FactoryNode, s: Settings): DashboardReadout['drain'] => {
  if (n.Ws < AMBER * 0.85 && n.lvl === 0) return null;
  const dr = drainOf(n, s);
  return dr.grow > 0.05 ? { kind: 'grow', n: dr.grow } : { kind: 'clears', weeks: dr.weeks };
};

export const sparkPaths = (data: readonly (number | null)[], ref: number | null, max: number): TrendPaths => {
  const pts = data
    .map((v, i) => [data.length > 1 ? (i / (data.length - 1)) * 100 : 0, v] as const)
    .filter((p): p is readonly [number, number] => p[1] !== null);
  const Y = (v: number) => (32 - (Math.min(v, max) / max) * 30).toFixed(1);
  const refPath = ref === null ? '' : `M0 ${Y(ref)} L100 ${Y(ref)}`;
  if (pts.length < 2) return { line: '', area: '', ref: refPath };
  const line = pts.map(([x, v], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${Y(v)}`).join(' ');
  const first = pts[0] as readonly [number, number],
    last = pts[pts.length - 1] as readonly [number, number];
  return { line, area: `${line} L${last[0].toFixed(1)} 34 L${first[0].toFixed(1)} 34 Z`, ref: refPath };
};

export const effToPos = (v: number): number => Math.round(Math.log10(v / 10) * 100);
export const posToEff = (p: number): number => {
  const v = 10 * 10 ** (p / 100);
  return v < 100 ? Math.round(v) : v < 300 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10;
};

const trends = (n: FactoryNode) => {
  const h = n.hist,
    ideal = n.idealJobs;
  return {
    out: sparkPaths(h.out, ideal, Math.max(ideal * 2.2, ...h.out, 1)),
    good: sparkPaths(h.good, 100, 100),
    wait: sparkPaths(h.wait, AMBER, Math.max(RED * 1.5, ...h.wait)),
  };
};

export const ownReadoutsOf = (m: Factory, n: FactoryNode, s: Settings): OwnReadout[] => {
  if (!productCo(s)) return [];
  const mode = custOf(m, s).mode;
  return m.srcs
    .filter((x) => x.n === n)
    .map((x) => {
      return { id: x.id, now: ownOf(x, { s, mode }), file: fileOwnOf(x, mode) };
    });
};

export const dashboardOf = (n: FactoryNode, s: Settings, own: readonly OwnReadout[] = []): DashboardReadout => {
  const d = dials(n, s),
    sg = signalsOf(n),
    tot = n.rate.out[0] + n.rate.out[1],
    tr = trends(n);
  return {
    id: n.id,
    own,
    light: sg.level,
    signals: sg.list,
    drain: drainFor(n, s),
    out: { now: n.rate.done, paths: tr.out },
    good: { now: tot > 0.05 ? Math.round((n.rate.out[1] / tot) * 100) : null, paths: tr.good },
    wait: { now: n.Ws, level: n.lvl, paths: tr.wait },
    dials: d,
    util: { busy: n.u.busy, blocked: n.u.blocked, starved: n.u.starved },
    flows: {
      done: n.rate.done,
      arriving: n.rate.arr,
      capacity: speedOf(n, d),
      backlog: n.Lavg,
      lead: leadTimeOf(n),
    },
  };
};

export interface CustomerDashboard {
  readonly cust: Cust;
  readonly base: number;
  readonly max: number;
  readonly mix: readonly string[];
  readonly good: readonly string[];
  readonly bad: readonly { readonly defect: Defect; readonly to: string }[];
  readonly gain: number;
  readonly complaints: boolean;
}

const targetsOf = (m: Factory, cu: Cust, kind: 'mix' | 'good'): string[] =>
  m.cust.outs
    .map((e) => e.to.id)
    .filter((to) => to in cu[kind] || m.B.data.presets.some((p) => p.customer?.[kind] && to in p.customer[kind]));

const badTargetsOf = (m: Factory, cu: Cust): { defect: Defect; to: string }[] => {
  const files = m.B.data.presets.map((p) => kindChancesOf(p.customer?.bad));
  return DEFECTS.flatMap((defect) =>
    m.cust.outs
      .map((e) => e.to.id)
      .filter((to) => to in cu.bad[defect] || files.some((k) => to in k[defect]))
      .map((to) => ({ defect, to })),
  );
};

export const customerDashboardOf = (m: Factory, x: { s: Settings; gain: number }): CustomerDashboard => {
  const s = x.s;
  const cu = custOf(m, s),
    base = m.B.data.customer.rate;
  return {
    cust: cu,
    base,
    max: Math.max(30, Math.ceil(base * 4)),
    mix: targetsOf(m, cu, 'mix'),
    good: targetsOf(m, cu, 'good'),
    bad: badTargetsOf(m, cu),
    gain: x.gain,
    complaints: s.mech.complaints,
  };
};
