/*
 * What the stage's DOM shows at one moment, read from a run four times a second (design-ADR 0024 §14): the clock,
 * every station, the Customer card, each belt's rates and rework lane, and the status line. Plain data, so React
 * redraws only the parts whose slice changed.
 */
import {
  customerDashboardOf,
  dashboardOf,
  type CustomerDashboard,
  type DashboardReadout,
} from './dashboard-readouts.pure.ts';
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
  /** The dashboards on show (an open popover; later the compare stream), by work center. */
  readonly dashboards: Readonly<Record<string, DashboardReadout>>;
  /** The Customer's dashboard while it is open. */
  readonly customerDash: CustomerDashboard | null;
}

/** What else a read covers: the dashboards on show, and whether their charts are redrawn this time. */
export interface ReadOptions {
  readonly watch?: readonly string[];
  /** Charts redraw at half the readouts' rate; otherwise the last read's trends stay. */
  readonly charts?: boolean;
  readonly prev?: Snapshot;
}

/** The headroom from the expected flows, solved again only when the settings change (a control writes new ones). */
const SOLVED = new WeakMap<FactoryRun['m']['s'], { readonly headroom: number; readonly gain: number }>();
const solvedOf = (run: FactoryRun) => {
  let h = SOLVED.get(run.m.s);
  if (h === undefined) {
    const r = solve(run.m, run.m.s);
    SOLVED.set(run.m.s, (h = { headroom: r.headroom, gain: r.gain }));
  }
  return h;
};

/** A dashboard keeps its last trends between chart redraws. */
const keepTrends = (d: DashboardReadout, prev: DashboardReadout | undefined): DashboardReadout =>
  prev
    ? {
        ...d,
        out: { ...d.out, paths: prev.out.paths },
        good: { ...d.good, paths: prev.good.paths },
        wait: { ...d.wait, paths: prev.wait.paths },
      }
    : d;

const dashboardsOf = (run: FactoryRun, o: ReadOptions): Snapshot['dashboards'] =>
  Object.fromEntries(
    (o.watch ?? []).flatMap((id) => {
      const n = run.m.nodes.get(id);
      if (!n || n.kind !== 'role') return [];
      const d = dashboardOf(n, run.m.s);
      return [[id, o.charts === false ? keepTrends(d, o.prev?.dashboards[id]) : d]];
    }),
  );

/** Warm-up progress in days, or null once the line runs. */
export const snapshotWarm = (run: FactoryRun): Snapshot['warming'] =>
  run.warming ? { day: Math.floor(run.m.t * DAYS), of: WARM_WEEKS * DAYS } : null;

export const snapshotOf = (run: FactoryRun, o: ReadOptions = {}): Snapshot => {
  const m = run.m,
    s = m.s,
    warming = run.warming;
  return {
    day: Math.floor(m.t * DAYS + 1e-9) + 1,
    warming: snapshotWarm(run),
    stations: Object.fromEntries(m.centers.map((n) => [n.id, stationOf(n, { m, s })])),
    customer: { ...customerOf(m, s), headroom: solvedOf(run).headroom },
    belts: Object.fromEntries(m.edges.map((e) => [e.key, { rate: e.rate, back: e.backRate, retOn: e.retOn }])),
    status: statusOf(m, { s, warming, dropped: run.dropped }),
    dashboards: dashboardsOf(run, o),
    customerDash: o.watch?.includes('customer') ? customerDashboardOf(m, { s, gain: solvedOf(run).gain }) : null,
  };
};
