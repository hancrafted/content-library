/*
 * What the factory model shows of itself (design-ADR 0024 §1, §14): its fixed shape (Topology) for the layout and the
 * cards, and the documents on the floor (Floor) for the painter, each document with named marks instead of the
 * model's flags. Types only; `factory-model.pure.ts` hands them out through its handle.
 */
import type { DocMarks } from './factory-docs.pure.ts';
import type { Belt, NodeDef } from './factory.types';
import type { Bundle, RoleDef } from './software-ecology.types';

/** A work center or the Customer, as the layout and the cards know it: where, what role, which belts. */
export interface TopoNode {
  readonly id: string;
  readonly idx: number;
  readonly kind: 'customer' | 'role';
  readonly def: NodeDef;
  readonly role: RoleDef;
  readonly roleId: string;
  readonly ins: readonly TopoBelt[];
  readonly outs: readonly TopoBelt[];
}

/** A belt between two nodes. */
export interface TopoBelt {
  readonly i: number;
  readonly key: string;
  readonly kind: Belt['kind'];
  readonly from: TopoNode;
  readonly to: TopoNode;
  readonly over: boolean;
  readonly loop: boolean;
  readonly returns: boolean;
  readonly release: boolean;
}

/** The network's fixed shape: who hands work to whom. It does not change while the factory runs. */
export interface Topology {
  readonly B: Bundle;
  readonly nodes: ReadonlyMap<string, TopoNode>;
  readonly edges: readonly TopoBelt[];
  readonly cust: TopoNode;
  readonly centers: readonly TopoNode[];
  /** Node ids in flow order, the Customer first. */
  readonly order: readonly string[];
}

/** A list read by index, newest last: the documents on a belt or the runs in a backlog. */
export interface FloorList<T> {
  readonly n: number;
  at(i: number): T;
}

/** Documents riding a belt, sent at `t0` and arriving at `t1` (model weeks); `c` of them alike. */
export interface FloorDoc extends DocMarks {
  readonly c: number;
  readonly t0: number;
  readonly t1: number;
}

/** A run of `c` alike documents waiting in a backlog. */
export interface FloorRun extends DocMarks {
  readonly c: number;
}

export interface FloorBelt extends TopoBelt {
  /** Documents a week on it, averaged. */
  readonly rate: number;
  readonly fwd: FloorList<FloorDoc>;
  /** Sent back to the sender. */
  readonly back: FloorList<FloorDoc>;
}

/** The document a station works on now. */
export interface FloorWork {
  busy: boolean;
  blocked: boolean;
  /** When the job started and ends, in model weeks. */
  start: number;
  end: number;
  /** It goes back to its sender instead of on. */
  bounce: boolean;
  /** It is stamped good as it ends. */
  stampGood: boolean;
  doc: DocMarks;
}

/** A work center on the floor: its waiting work, the document in work and whether AI works there. */
export interface FloorStation {
  readonly node: TopoNode;
  readonly ins: readonly FloorBelt[];
  /** Documents waiting. */
  readonly waiting: number;
  /** Weeks of work waiting, averaged. */
  readonly weeksWaiting: number;
  readonly queue: FloorList<FloorRun>;
  /** The document in work, or null while the station's person works elsewhere or idles. Read it again each frame. */
  readonly work: FloorWork | null;
  readonly ai: boolean;
}

/** The documents on the floor, read every frame by the painter. Live: it follows the model. */
export interface Floor {
  /** Model time, in weeks. */
  readonly t: number;
  readonly seed: number;
  readonly belts: readonly FloorBelt[];
  readonly stations: readonly FloorStation[];
  station(id: string): FloorStation | undefined;
  belt(key: string): FloorBelt | undefined;
}

/** What happens on the floor: a request, an arrival or a sent-back document lands, an own ticket, a job starts or ends. */
export type FloorEvent = 'request' | 'arrive' | 'front' | 'own' | 'start' | 'done';
/** Where a floor event happened: the belt, and the document that landed or, for a request, its time in weeks. */
export interface FloorAt {
  readonly belt: FloorBelt;
  readonly x: FloorDoc | number;
}
/** Hears floor events: the station (null for the Customer) and, for a landing or a request, where. */
export type FloorListener = (what: FloorEvent, station: FloorStation | null, at?: FloorAt) => void;
