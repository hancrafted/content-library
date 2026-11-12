/*
 * What a work center's dashboard shows (design-ADR 0024 §7, §17): the traffic light and its signals, how its backlog
 * drains, three trends, the dials as set and in effect, and "How it flows" in plain numbers. The Customer's dashboard
 * reads its settings and the follow-ups a request brings. Plain data the views turn into words; ported from the
 * reference build's `signals`, `leadTime`, `drainText`, `sparkline` and `syncDashboard`.
 */
import { AMBER, custOf, dials, RED, speedOf } from './factory-dials.pure.ts';
import type { Dials, Factory, FactoryNode } from './factory.types';
import type { Cust, Settings } from './software-ecology.types';
import { drainOf } from './stage-readouts.pure.ts';

export type Level = 'red' | 'amber' | 'green';
export type SignalKind = 'backing' | 'bottleneck' | 'overloaded' | 'rework' | 'unread' | 'starved' | 'ok';

export interface Signal {
  readonly kind: SignalKind;
  readonly level: Level;
  /** Weeks of work waiting (bottleneck, overloaded) or the share coming back, in % (rework). */
  readonly n: number;
}

/** A trend's three SVG paths in a 100 × 34 box. */
export interface TrendPaths {
  readonly line: string;
  readonly area: string;
  readonly ref: string;
}

export interface DashboardReadout {
  readonly id: string;
  readonly light: Level;
  readonly signals: readonly Signal[];
  /** How the backlog drains, or null while under a week of work waits. */
  readonly drain:
    { readonly kind: 'grow'; readonly n: number } | { readonly kind: 'clears'; readonly weeks: number } | null;
  readonly out: { readonly now: number; readonly paths: TrendPaths };
  /** Share good in %, or null while too little leaves. */
  readonly good: { readonly now: number | null; readonly paths: TrendPaths };
  readonly wait: { readonly now: number; readonly level: number; readonly paths: TrendPaths };
  readonly dials: Dials;
  readonly util: { readonly busy: number; readonly blocked: number; readonly starved: number };
  readonly flows: {
    readonly done: number;
    readonly arriving: number;
    readonly capacity: number;
    readonly backlog: number;
    /** Weeks a job spends here by Little's law, or null while the backlog is not steady. */
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

/** The reference build's checks, in its order. */
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

/** Little's law holds only while the backlog is steady: the average backlog now against four weeks ago. */
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

/** A line chart over the last 16 weeks in a 100 × 34 box, with a dashed reference line. */
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

/** The efficiency slider is logarithmic: positions 0 … 200 are 10 % … 1000 %. */
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

export const dashboardOf = (n: FactoryNode, s: Settings): DashboardReadout => {
  const d = dials(n, s),
    sg = signalsOf(n),
    tot = n.rate.out[0] + n.rate.out[1],
    tr = trends(n);
  return {
    id: n.id,
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
  /** The rate the file sizes Ideal for. */
  readonly base: number;
  /** The rate slider's top: four times the file's rate, at least 30. */
  readonly max: number;
  readonly mix: readonly string[];
  readonly good: readonly string[];
  readonly bad: readonly string[];
  /** New requests one request brings, from the expected flows. */
  readonly gain: number;
  readonly complaints: boolean;
}

/** The work centers the Customer sends to that its file or a preset gives a `kind` value. */
const targetsOf = (m: Factory, cu: Cust, kind: 'mix' | 'good' | 'bad'): string[] =>
  m.cust.outs
    .map((e) => e.to.id)
    .filter((to) => to in cu[kind] || m.B.data.presets.some((p) => p.customer?.[kind] && to in p.customer[kind]));

/** The Customer's dashboard at `s`; `gain` comes from the expected flows, solved once per settings. */
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
    bad: targetsOf(m, cu, 'bad'),
    gain: x.gain,
    complaints: s.mech.complaints,
  };
};
