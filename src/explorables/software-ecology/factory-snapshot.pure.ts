// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import {
  customerDashboardOf,
  dashboardOf,
  ownReadoutsOf,
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
  readonly day: number;
  readonly warming: { readonly day: number; readonly of: number } | null;
  readonly stations: Readonly<Record<string, StationReadout>>;
  readonly customer: CustomerReadout & { readonly headroom: number };
  readonly belts: Readonly<Record<string, BeltReadout>>;
  readonly status: Status;
  readonly dashboards: Readonly<Record<string, DashboardReadout>>;
  readonly customerDash: CustomerDashboard | null;
  readonly columns: Readonly<Record<string, ColumnReadout>>;
  readonly measures: Readonly<Record<string, number>>;
  readonly audit: Audit | null;
}

export interface Audit {
  readonly created: number;
  readonly consumed: number;
  readonly backlog: number;
  readonly transit: number;
  readonly work: number;
  readonly gap: number;
  readonly hash: string;
}

export interface ReadOptions {
  readonly watch?: readonly string[];
  readonly charts?: boolean;
  readonly prev?: Snapshot;
  readonly stream?: readonly string[];
  readonly measures?: readonly string[];
  readonly audit?: boolean;
  readonly warming?: Snapshot['warming'];
  readonly dropped?: number;
}

const SOLVED = new WeakMap<Factory['s'], { readonly headroom: number; readonly gain: number }>();
const solvedOf = (m: Factory) => {
  let h = SOLVED.get(m.s);
  if (h === undefined) {
    const r = solve(m, m.s);
    SOLVED.set(m.s, (h = { headroom: r.headroom, gain: r.gain }));
  }
  return h;
};

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
      const d = dashboardOf(n, m.s, ownReadoutsOf(m, n, m.s));
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
