/*
 * Readouts of the factory model (design-ADR 0024 §1, §10): the measures a scenario's `expect:` names, the Snapshot the
 * cards read, the traffic light of a work center, conservation and a state hash for the checks.
 */
import { DAYS, dials, rushOf, speedOf } from './factory-dials.pure.ts';
import { solve } from './factory-solve.pure.ts';
import type { Factory, FactoryNode, Server } from './factory.types';
import type { Settings } from './software-ecology.types';

export const backlogOf = (m: Factory): number => m.centers.reduce((a, n) => a + n.L, 0);
const inWork = (m: Factory): number => m.servers.reduce((a, sv) => a + (sv.busy || sv.blocked ? 1 : 0), 0);
const inTransit = (m: Factory): number => m.edges.reduce((a, e) => a + e.inT + e.backT, 0);

/** Documents created = received by the Customer or finished + waiting + on belts + in work. */
export const conservation = (m: Factory) => {
  const backlog = backlogOf(m),
    transit = inTransit(m),
    work = inWork(m);
  return {
    created: m.created,
    consumed: m.consumed,
    backlog,
    transit,
    work,
    gap: m.created - m.consumed - backlog - transit - work,
  };
};

export const weeksOfWork = (n: FactoryNode, s: Settings): number => n.L / speedOf(n, dials(n, s));
/** Satisfaction over the averaged releases: good ones minus complaints, out of all. */
export const satRate = (m: Factory): number => {
  const t = m.rel[0] + m.rel[1];
  return t > 0.05 ? Math.max(0, m.rel[1] - m.compl) / t : 1;
};

export type CustomerMeasure = 'output' | 'sat' | 'headroom' | 'leadDays' | 'bugsPerWeek' | 'own' | 'backlog';
export type CenterMeasure = 'weeksWaiting' | 'busy' | 'bugShare' | 'backlog' | 'done' | 'rework' | 'rush';

export const CUSTOMER_MEASURES: Readonly<Record<CustomerMeasure, (m: Factory) => number>> = {
  output: (m) => (m.idealOut ? m.outRate / m.idealOut : 0),
  sat: (m) => satRate(m),
  headroom: (m) => solve(m, m.s).headroom,
  leadDays: (m) => (m.mainRate > 0.05 ? (m.wipAvg / m.mainRate) * DAYS : 0),
  bugsPerWeek: (m) => m.compl,
  own: (m) => m.ownRate,
  backlog: (m) => backlogOf(m),
};

export const CENTER_MEASURES: Readonly<Record<CenterMeasure, (n: FactoryNode) => number>> = {
  weeksWaiting: (n) => n.Ws,
  busy: (n) => n.u.busy,
  bugShare: (n) => (n.u.busy > 0.02 ? n.u.fail / n.u.busy : 0),
  backlog: (n) => n.L,
  done: (n) => n.rate.done,
  rework: (n) => (n.rate.arr > 0.05 ? n.rate.rwIn / n.rate.arr : 0),
  rush: (n) => rushOf(n),
};

/** A hash of the whole state, for the determinism check. */
export const stateHash = (m: Factory): string => {
  let h = 2166136261;
  const add = (x: number) => {
    h = Math.imul(h ^ (Math.round(x * 1e6) | 0), 16777619) >>> 0;
  };
  [m.t, m.created, m.consumed, m.outN].forEach(add);
  for (const n of m.centers) [n.L, n.rate.done].forEach(add);
  for (const e of m.edges) [e.inT, e.backT].forEach(add);
  for (const sv of m.servers) add(sv.end);
  return h.toString(16);
};

export interface CenterSnapshot {
  readonly id: string;
  readonly backlog: number;
  readonly weeksWaiting: number;
  readonly rush: number;
  readonly busy: number;
  readonly inWork: boolean;
  /** 0 keeping up, 1 amber from a week of work waiting, 2 red from two. */
  readonly level: number;
}

/** What the cards read: every work center, the belts' documents in transit and the Customer's measures. */
export interface Snapshot {
  readonly week: number;
  readonly centers: readonly CenterSnapshot[];
  readonly transit: Readonly<Record<string, number>>;
  readonly customer: Readonly<Record<Exclude<CustomerMeasure, 'headroom'>, number>>;
}

const centerOf = (n: FactoryNode): CenterSnapshot => {
  const sv = n.server as Server;
  return {
    id: n.id,
    backlog: n.L,
    weeksWaiting: n.Ws,
    rush: rushOf(n),
    busy: n.u.busy,
    inWork: sv.n === n && (sv.busy || sv.blocked),
    level: n.lvl,
  };
};

/** The Snapshot; headroom needs a traffic solve, so it is read apart, through CUSTOMER_MEASURES. */
export const readout = (m: Factory): Snapshot => {
  const c = CUSTOMER_MEASURES;
  return {
    week: m.t,
    centers: m.centers.map(centerOf),
    transit: Object.fromEntries(m.edges.map((e) => [e.key, e.inT + e.backT])),
    customer: {
      output: c.output(m),
      sat: c.sat(m),
      leadDays: c.leadDays(m),
      bugsPerWeek: c.bugsPerWeek(m),
      own: c.own(m),
      backlog: c.backlog(m),
    },
  };
};
