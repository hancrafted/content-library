// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { DAYS, Q, dials, speedOf } from './factory-dials.pure.ts';
import { SHELF } from './factory-flow.pure.ts';
import { CENTER_MEASURES } from './factory-readouts.pure.ts';
import type { Factory, FactoryNode } from './factory.types';
import type { Arrivals, Settings } from './software-ecology.types';
import { custOf } from './start-settings.pure.ts';

export const SHELF_ROWS = 4;
export const SHELF_COLS = Math.ceil(SHELF / SHELF_ROWS);

/** A sign stays this many weeks after its last event, so it does not blink. */
export const SIGN_HOLD = 1.5;
export const RACK = 6;
export const LEVEL_RED = 2;

export type SignKind = 'rework' | 'churn' | 'unread' | 'complaint';

export interface StationReadout {
  readonly id: string;
  readonly waiting: number;
  readonly weeks: number;
  readonly ai: boolean;
  readonly piling: boolean;
  readonly level: number;
  readonly bugShare: number;
  readonly rework: number;
  readonly signs: Readonly<Record<SignKind, boolean>>;
}

export interface Release {
  readonly good: boolean;
  readonly complaint: boolean;
}

export interface CustomerReadout {
  readonly releases: readonly (Release | null)[];
  readonly output: number;
  readonly rate: number;
  readonly sat: number;
  readonly leadDays: number | null;
  readonly bugs: number;
  readonly own: number;
  readonly ownShown: boolean;
  readonly requests: number;
  readonly arrivals: Arrivals;
}

const signOn = (n: FactoryNode, k: SignKind, x: { m: Factory; s: Settings }): boolean => {
  const mech = x.s.mech,
    on = k === 'rework' ? mech.rework : k === 'churn' ? mech.churn : k === 'complaint' ? mech.complaints : true;
  return on && x.m.t - n.sign[k] < SIGN_HOLD;
};

const SIGNS: readonly SignKind[] = ['rework', 'churn', 'unread', 'complaint'];

export const stationOf = (n: FactoryNode, x: { m: Factory; s: Settings }): StationReadout => ({
  id: n.id,
  waiting: n.L,
  weeks: n.L / speedOf(n, dials(n, x.s)),
  ai: dials(n, x.s).ai,
  piling: n.L > RACK,
  level: n.lvl,
  bugShare: n.u.busy > 0.02 ? n.u.fail / n.u.busy : 0,
  rework: Math.round(CENTER_MEASURES.rework(n, x.m) * 100) / 100,
  signs: Object.fromEntries(SIGNS.map((k) => [k, signOn(n, k, x)])) as Record<SignKind, boolean>,
});

export const shelfSat = (m: Pick<Factory, 'shelf'>): number => {
  const g = m.shelf.filter((r) => r.q === Q.GOOD).length,
    c = m.shelf.filter((r) => r.compl).length;
  return m.shelf.length ? Math.max(0, g - c) / m.shelf.length : 1;
};

export const releasesOf = (m: Pick<Factory, 'shelf'>): (Release | null)[] =>
  Array.from({ length: SHELF }, (_, i) => {
    const r = m.shelf[m.shelf.length - 1 - i];
    return r ? { good: r.q === Q.GOOD, complaint: r.compl } : null;
  });

export const customerOf = (m: Factory, s: Settings): CustomerReadout => {
  const cu = custOf(m, s);
  return {
    releases: releasesOf(m),
    output: m.idealOut ? m.outRate / m.idealOut : 1,
    rate: m.outRate,
    sat: shelfSat(m),
    leadDays: m.mainRate > 0.05 ? (m.wipAvg / m.mainRate) * DAYS : null,
    bugs: m.compl,
    own: m.ownRate,
    ownShown: s.company === 'product' && m.srcs.length > 0,
    requests: cu.rate,
    arrivals: cu.mode,
  };
};

export const drainOf = (n: FactoryNode, s: Settings): { readonly weeks: number; readonly grow: number } => {
  const free = speedOf(n, dials(n, s)) - n.rate.arr;
  return { weeks: free > 0.05 ? n.L / free : Infinity, grow: -free };
};

export const isIdeal = (m: Factory, s: Settings): boolean =>
  s.reality === 0 &&
  s.ai === 'off' &&
  custOf(m, s).rate === m.B.data.customer.rate &&
  Object.values(s.over).every((o) => !Object.keys(o).length);

export interface HotCenter {
  readonly id: string;
  readonly red: boolean;
  readonly weeks: number;
}

export type Status =
  | { readonly kind: 'warming' }
  | { readonly kind: 'calm' }
  | {
      readonly kind: 'busy';
      readonly hot: readonly HotCenter[];
      readonly drain: { readonly weeks: number; readonly grow: number } | null;
      readonly back: number;
      readonly behind: boolean;
    };

export const statusOf = (m: Factory, x: { s: Settings; warming: boolean; dropped: number }): Status => {
  if (x.warming) return { kind: 'warming' };
  if (isIdeal(m, x.s) && m.centers.every((n) => !n.lvl)) return { kind: 'calm' };
  const hot = m.centers.filter((n) => n.lvl).sort((a, b) => b.Ws - a.Ws);
  const first = hot[0];
  return {
    kind: 'busy',
    hot: hot.map((n) => ({ id: n.id, red: n.lvl === LEVEL_RED, weeks: n.Ws })),
    drain: first ? drainOf(first, x.s) : null,
    back: Math.round(m.centers.reduce((a, n) => a + n.rate.back, 0)),
    behind: x.dropped > 0.5,
  };
};

export type Verdict = 'moreUnhappier' | 'unhappy' | 'fewer' | 'asked';
export const verdictOf = (output: number, sat: number): Verdict =>
  output > 1.15 && sat < 0.75 ? 'moreUnhappier' : sat < 0.6 ? 'unhappy' : output < 0.85 ? 'fewer' : 'asked';

export type Relative = { readonly kind: 'same' | 'half' | 'third' } | { readonly kind: 'times'; readonly k: number };
export const relativeOf = (k: number): Relative =>
  k > 0.9 && k < 1.1 ? { kind: 'same' } : k < 0.6 ? { kind: k < 0.4 ? 'third' : 'half' } : { kind: 'times', k };

export interface Chip {
  readonly good: boolean;
  readonly ai: boolean;
  readonly warn: boolean;
}

export interface ColumnReadout {
  readonly queue: readonly Chip[];
  readonly more: number;
  readonly waiting: number;
  readonly weeks: number;
  readonly busy: number;
  readonly done: number;
}

const QUEUE_SHOWN = 10;

const queueOf = (n: FactoryNode): Chip[] => {
  const out: Chip[] = [];
  for (let i = 0; i < n.runs.n && out.length < QUEUE_SHOWN; i++) {
    const r = n.runs.at(i),
      chip = { good: !r.complaint && r.good, ai: !!r.ai, warn: r.redo || r.complaint };
    for (let j = 0; j < r.c && out.length < QUEUE_SHOWN; j++) out.push(chip);
  }
  return out;
};

export const columnOf = (n: FactoryNode): ColumnReadout => ({
  queue: queueOf(n),
  more: Math.max(0, n.L - QUEUE_SHOWN),
  waiting: n.L,
  weeks: n.Ws,
  busy: Math.round(n.u.busy * 100),
  done: n.rate.done,
});
