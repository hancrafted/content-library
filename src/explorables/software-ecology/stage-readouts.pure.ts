/*
 * What the stage's DOM shows, read from the model a few times a second (design-ADR 0024 §14): each station's waiting
 * work, signs and AI, the Customer card, the belts' rates, the status line and the At the Customer panel. Plain data,
 * so React re-renders only what changed; the words are the parts' own.
 */
import { DAYS, Q, custOf, dials, speedOf } from './factory-dials.pure.ts';
import { SHELF } from './factory-flow.pure.ts';
import type { Factory, FactoryNode } from './factory.types';
import type { Arrivals, Settings } from './software-ecology.types';

/** The release shelf is drawn this many cells across; its rows follow from SHELF. */
export const SHELF_COLS = 4;
export const SHELF_ROWS = Math.ceil(SHELF / SHELF_COLS);

/** A sign stays this many weeks after its last event, so it does not blink. */
export const SIGN_HOLD = 1.5;
/** The rack holds six; past six the top slot turns red and work piles up. */
export const RACK = 6;
/** A station's waiting band at its worst: red, from two weeks of work waiting (`StationReadout.level`). */
export const LEVEL_RED = 2;

export type SignKind = 'rework' | 'churn' | 'unread' | 'complaint';

export interface StationReadout {
  readonly id: string;
  readonly waiting: number;
  /** Weeks of work waiting now, at the current pace. */
  readonly weeks: number;
  readonly ai: boolean;
  readonly piling: boolean;
  /** Weeks of work waiting as a band: 0 under a week, 1 (amber) from one, 2 (red) from two. */
  readonly level: number;
  /** Share of its busy time on bugs, shown from 5 %; 0 below. */
  readonly bugShare: number;
  readonly signs: Readonly<Record<SignKind, boolean>>;
}

/** One of the last twenty releases: good or bad, and whether it brought a complaint. */
export interface Release {
  readonly good: boolean;
  readonly complaint: boolean;
}

export interface CustomerReadout {
  /** The last twenty releases, newest first; null for an empty cell. */
  readonly releases: readonly (Release | null)[];
  /** Fulfilled requests a week relative to Ideal. */
  readonly output: number;
  /** Fulfilled requests a week. */
  readonly rate: number;
  /** Good releases minus complaints, out of the last twenty. */
  readonly sat: number;
  /** Working days from request to release; null until requests flow. */
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
  signs: Object.fromEntries(SIGNS.map((k) => [k, signOn(n, k, x)])) as Record<SignKind, boolean>,
});

/** Satisfaction over the last twenty releases: good ones minus complaints. */
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

/** How a backlog clears at this pace: weeks to clear, or jobs it grows by a week. */
export const drainOf = (n: FactoryNode, s: Settings): { readonly weeks: number; readonly grow: number } => {
  const free = speedOf(n, dials(n, s)) - n.rate.arr;
  return { weeks: free > 0.05 ? n.L / free : Infinity, grow: -free };
};

/** No dial moved off Ideal. */
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

/** What the status line says, as data. */
export type Status =
  | { readonly kind: 'warming' }
  | { readonly kind: 'calm' }
  | {
      readonly kind: 'busy';
      /** Centers with a week or more of work waiting, the most first. */
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

/** The At the Customer panel's verdict. */
export type Verdict = 'moreUnhappier' | 'unhappy' | 'fewer' | 'asked';
export const verdictOf = (output: number, sat: number): Verdict =>
  output > 1.15 && sat < 0.75 ? 'moreUnhappier' : sat < 0.6 ? 'unhappy' : output < 0.85 ? 'fewer' : 'asked';

/** How output compares with Ideal, in words: about as much, about half or a third, or a multiple. */
export type Relative = { readonly kind: 'same' | 'half' | 'third' } | { readonly kind: 'times'; readonly k: number };
export const relativeOf = (k: number): Relative =>
  k > 0.9 && k < 1.1 ? { kind: 'same' } : k < 0.6 ? { kind: k < 0.4 ? 'third' : 'half' } : { kind: 'times', k };

/** A document as a chip in the stream: its quality, AI-made, a warning for rework or a complaint. */
export interface Chip {
  readonly good: boolean;
  readonly ai: boolean;
  readonly warn: boolean;
}

/** What a column's station shows besides its signs: the backlog as chips, and its plain numbers. */
export interface ColumnReadout {
  /** The front of the backlog, at most ten chips. */
  readonly queue: readonly Chip[];
  /** Waiting beyond the chips, the "+n". */
  readonly more: number;
  readonly waiting: number;
  /** Weeks of work waiting. */
  readonly weeks: number;
  /** Busy, in percent. */
  readonly busy: number;
  /** Done a week. */
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

/** A compare column's station: the front of its backlog as chips, and its plain numbers. */
export const columnOf = (n: FactoryNode): ColumnReadout => ({
  queue: queueOf(n),
  more: Math.max(0, n.L - QUEUE_SHOWN),
  waiting: n.L,
  weeks: n.Ws,
  busy: Math.round(n.u.busy * 100),
  done: n.rate.done,
});
