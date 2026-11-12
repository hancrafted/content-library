/*
 * The Floor over a network (design-ADR 0024 §14): one Station per work center, reading the network live; a document's
 * marks are named fields of the model's own documents. Model-internal: `createFactory` builds it once per model.
 */
import { dials } from './factory-dials.pure.ts';
import { Q } from './factory-docs.pure.ts';
import type { Floor, FloorBelt, FloorList, FloorRun, FloorStation, FloorWork, TopoNode } from './factory-reads.types';
import type { Factory, FactoryNode, Server } from './factory.types';

const workOf = (sv: Server): FloorWork['doc'] => sv.J;

/** A work center on the floor, over its node: the reads follow the model, one reused object for the work. */
class Station implements FloorStation {
  private readonly w: FloorWork = {
    busy: false,
    blocked: false,
    start: 0,
    end: 0,
    bounce: false,
    stampGood: false,
    doc: { ai: 0, good: true, complaint: false, redo: false, fromCustomer: false, own: false },
  };
  private readonly n: FactoryNode;
  private readonly m: Factory;
  constructor(n: FactoryNode, m: Factory) {
    this.n = n;
    this.m = m;
  }
  get node(): TopoNode {
    return this.n;
  }
  get ins(): readonly FloorBelt[] {
    return this.n.ins;
  }
  get waiting(): number {
    return this.n.L;
  }
  get weeksWaiting(): number {
    return this.n.Ws;
  }
  get queue(): FloorList<FloorRun> {
    return this.n.runs;
  }
  get ai(): boolean {
    return dials(this.n, this.m.s).ai;
  }
  get work(): FloorWork | null {
    const sv = this.n.server;
    if (!sv || sv.n !== this.n || !(sv.busy || sv.blocked)) return null;
    return Object.assign(this.w, {
      busy: sv.busy,
      blocked: sv.blocked,
      start: sv.start,
      end: sv.end,
      bounce: sv.bounce,
      stampGood: sv.preQ === Q.GOOD && !sv.bounce,
      doc: workOf(sv),
    });
  }
}

export const floorOf = (m: Factory): { floor: Floor; stationOf: (n: FactoryNode) => Station | null } => {
  const stations = m.centers.map((n) => new Station(n, m)),
    byNode = new Map(m.centers.map((n, i) => [n, stations[i] as Station])),
    byId = new Map(m.centers.map((n, i) => [n.id, stations[i] as Station])),
    byKey = new Map(m.edges.map((e) => [e.key, e]));
  const floor: Floor = {
    get t() {
      return m.t;
    },
    seed: m.seed,
    belts: m.edges,
    stations,
    station: (id) => byId.get(id),
    belt: (key) => byKey.get(key),
  };
  return { floor, stationOf: (n) => byNode.get(n) ?? null };
};
