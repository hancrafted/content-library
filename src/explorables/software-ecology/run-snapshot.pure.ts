/*
 * What the stage's DOM shows at one moment, read from a run four times a second (design-ADR 0024 §14): the clock,
 * every station, the Customer card, each belt's rates and rework lane, and the status line. Plain data, so React
 * redraws only the parts whose slice changed.
 */
import { DAYS, WARM_WEEKS } from './factory-dials.pure.ts';
import type { FactoryRun } from './factory-run.pure.ts';
import { solve } from './factory-solve.pure.ts';
import {
  customerOf,
  stationOf,
  statusOf,
  type CustomerReadout,
  type StationReadout,
  type Status,
} from './stage-readouts.pure.ts';

export interface BeltReadout {
  readonly rate: number;
  readonly back: number;
  readonly retOn: boolean;
}

export interface Snapshot {
  /** The working day shown on the clock, from 1. */
  readonly day: number;
  /** Warm-up progress, in days, or null once the line runs. */
  readonly warming: { readonly day: number; readonly of: number } | null;
  readonly stations: Readonly<Record<string, StationReadout>>;
  readonly customer: CustomerReadout & { readonly headroom: number };
  readonly belts: Readonly<Record<string, BeltReadout>>;
  readonly status: Status;
}

/** The headroom from the expected flows; settings change only on a rebuild, so it is solved once a run. */
const HEADROOM = new WeakMap<FactoryRun, number>();
const headroomOf = (run: FactoryRun): number => {
  let h = HEADROOM.get(run);
  if (h === undefined) HEADROOM.set(run, (h = solve(run.m, run.m.s).headroom));
  return h;
};

/** Warm-up progress in days, or null once the line runs. */
export const snapshotWarm = (run: FactoryRun): Snapshot['warming'] =>
  run.warming ? { day: Math.floor(run.m.t * DAYS), of: WARM_WEEKS * DAYS } : null;

export const snapshotOf = (run: FactoryRun): Snapshot => {
  const m = run.m,
    s = m.s,
    warming = run.warming;
  return {
    day: Math.floor(m.t * DAYS + 1e-9) + 1,
    warming: snapshotWarm(run),
    stations: Object.fromEntries(m.centers.map((n) => [n.id, stationOf(n, { m, s })])),
    customer: { ...customerOf(m, s), headroom: headroomOf(run) },
    belts: Object.fromEntries(m.edges.map((e) => [e.key, { rate: e.rate, back: e.backRate, retOn: e.retOn }])),
    status: statusOf(m, { s, warming, dropped: run.dropped }),
  };
};
