/*
 * The model's Snapshot (design-ADR 0024 §1, §14): what a read of the factory gives at one moment — the clock, every
 * station, the Customer card, each belt's rates and rework lane, the status line, the dashboards on show, the compare
 * stream's columns and any measure a scenario names. Plain data, so React redraws only the parts whose slice changed.
 * Model-side: only `factory-model.pure.ts` calls it; everything else reads the Snapshot through the handle.
 */
import {
  customerDashboardOf,
  dashboardOf,
  type CustomerDashboard,
  type DashboardReadout,
} from './dashboard-readouts.pure.ts';
import { DAYS } from './factory-dials.pure.ts';
import { metric } from './factory-measures.pure.ts';
import { conservation, stateHash } from './factory-readouts.pure.ts';
import { solve } from './factory-solve.pure.ts';
import type { Factory } from './factory.types';
import {
  columnOf,
  customerOf,
  stationOf,
  statusOf,
  type ColumnReadout,
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
  /** The dashboards on show (an open popover, the compare stream's columns), by work center. */
  readonly dashboards: Readonly<Record<string, DashboardReadout>>;
  /** The Customer's dashboard while it is open. */
  readonly customerDash: CustomerDashboard | null;
  /** The compare stream's stations, by work center, while it is shown. */
  readonly columns: Readonly<Record<string, ColumnReadout>>;
  /** The measures asked for, by key (`customer.output`, `qa.weeksWaiting`): what a scenario's `expect:` judges. */
  readonly measures: Readonly<Record<string, number>>;
  /** Conservation and a state hash, when asked for: the model's own checks. */
  readonly audit: Audit | null;
}

/** Documents created = received + waiting + on belts + in work (`gap` 0), and a hash of the whole state. */
export interface Audit {
  readonly created: number;
  readonly consumed: number;
  readonly backlog: number;
  readonly transit: number;
  readonly work: number;
  readonly gap: number;
  readonly hash: string;
}

/** What else a read covers: the dashboards on show, and whether their charts are redrawn this time. */
export interface ReadOptions {
  readonly watch?: readonly string[];
  /** Charts redraw at half the readouts' rate; otherwise the last read's trends stay. */
  readonly charts?: boolean;
  readonly prev?: Snapshot;
  /** The work centers in the compare stream. */
  readonly stream?: readonly string[];
  /** Measures to read, by key: `customer.<measure>` or `<center>.<measure>`. */
  readonly measures?: readonly string[];
  /** Read conservation and the state hash. */
  readonly audit?: boolean;
  /** The run's warm-up progress in days, or null once the line runs. */
  readonly warming?: Snapshot['warming'];
  /** How far the frames fell behind (0 on time), for the status line. */
  readonly dropped?: number;
}

/** The headroom from the expected flows, solved again only when the settings change (a control writes new ones). */
const SOLVED = new WeakMap<Factory['s'], { readonly headroom: number; readonly gain: number }>();
const solvedOf = (m: Factory) => {
  let h = SOLVED.get(m.s);
  if (h === undefined) {
    const r = solve(m, m.s);
    SOLVED.set(m.s, (h = { headroom: r.headroom, gain: r.gain }));
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

const dashboardsOf = (m: Factory, o: ReadOptions): Snapshot['dashboards'] =>
  Object.fromEntries(
    (o.watch ?? []).flatMap((id) => {
      const n = m.nodes.get(id);
      if (!n || n.kind !== 'role') return [];
      const d = dashboardOf(n, m.s);
      return [[id, o.charts === false ? keepTrends(d, o.prev?.dashboards[id]) : d]];
    }),
  );

const columnsOf = (m: Factory, ids: readonly string[] = []): Snapshot['columns'] =>
  Object.fromEntries(
    ids.flatMap((id) => {
      const n = m.nodes.get(id);
      return n && n.kind === 'role' ? [[id, columnOf(n)]] : [];
    }),
  );

const auditOf = (m: Factory): Audit => ({ ...conservation(m), hash: stateHash(m) });

/** What a read covers beyond the stage: the dashboards and columns on show, measures and the audit. */
const extrasOf = (m: Factory, o: ReadOptions) => ({
  dashboards: dashboardsOf(m, o),
  customerDash: o.watch?.includes('customer') ? customerDashboardOf(m, { s: m.s, gain: solvedOf(m).gain }) : null,
  columns: columnsOf(m, o.stream),
  measures: Object.fromEntries((o.measures ?? []).map((k) => [k, metric(m, k)])),
  audit: o.audit ? auditOf(m) : null,
});

export const snapshotOf = (m: Factory, o: ReadOptions = {}): Snapshot => {
  const s = m.s,
    warming = o.warming ?? null;
  return {
    day: Math.floor(m.t * DAYS + 1e-9) + 1,
    warming,
    stations: Object.fromEntries(m.centers.map((n) => [n.id, stationOf(n, { m, s })])),
    customer: { ...customerOf(m, s), headroom: solvedOf(m).headroom },
    belts: Object.fromEntries(m.edges.map((e) => [e.key, { rate: e.rate, back: e.backRate, retOn: e.retOn }])),
    status: statusOf(m, { s, warming: warming !== null, dropped: o.dropped ?? 0 }),
    ...extrasOf(m, o),
  };
};
