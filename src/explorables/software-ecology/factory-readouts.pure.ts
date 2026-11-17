// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { DAYS, dials, rushOf, stallOf } from './factory-dials.pure.ts';
import { solve } from './factory-solve.pure.ts';
import type { Factory, FactoryNode } from './factory.types';

export const backlogOf = (m: Factory): number => m.centers.reduce((a, n) => a + n.L, 0);
const inWork = (m: Factory): number => m.servers.reduce((a, sv) => a + (sv.busy || sv.blocked ? 1 : 0), 0);
const inTransit = (m: Factory): number => m.edges.reduce((a, e) => a + e.inT + e.backT, 0);

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

export const satRate = (m: Factory): number => {
  const t = m.rel[0] + m.rel[1];
  return t > 0.05 ? Math.max(0, m.rel[1] - m.compl) / t : 1;
};

export type CustomerMeasure =
  | 'output'
  | 'sat'
  | 'headroom'
  | 'leadDays'
  | 'bugsPerWeek'
  | 'changesPerWeek'
  | 'own'
  | 'backlog';
export type CenterMeasure =
  | 'weeksWaiting'
  | 'busy'
  | 'bugShare'
  | 'backlog'
  | 'done'
  | 'rework'
  | 'rush'
  | 'unread'
  | 'stall';

export const CUSTOMER_MEASURES: Readonly<Record<CustomerMeasure, (m: Factory) => number>> = {
  output: (m) => (m.idealOut ? m.outRate / m.idealOut : 0),
  sat: (m) => satRate(m),
  headroom: (m) => solve(m, m.s).headroom,
  leadDays: (m) => (m.mainRate > 0.05 ? (m.wipAvg / m.mainRate) * DAYS : 0),
  bugsPerWeek: (m) => m.complK.code,
  changesPerWeek: (m) => m.complK.spec,
  own: (m) => m.ownRate,
  backlog: (m) => backlogOf(m),
};

export const CENTER_MEASURES: Readonly<Record<CenterMeasure, (n: FactoryNode, m: Factory) => number>> = {
  weeksWaiting: (n) => n.Ws,
  busy: (n) => n.u.busy,
  bugShare: (n) => (n.u.busy > 0.02 ? n.u.fail / n.u.busy : 0),
  backlog: (n) => n.L,
  done: (n) => n.rate.done,
  rework: (n) => (n.rate.arr > 0.05 ? n.rate.rwIn / n.rate.arr : 0),
  rush: (n) => rushOf(n),
  stall: (n, m) => stallOf(n, dials(n, m.s)),
  unread: (n) => (n.rate.badIn > 0.05 ? n.rate.badPass / n.rate.badIn : 0),
};

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
