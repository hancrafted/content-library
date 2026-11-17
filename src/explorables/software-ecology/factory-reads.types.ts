// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import type { DocMarks } from './factory-docs.pure.ts';
import type { Belt, NodeDef } from './factory.types';
import type { Bundle, RoleDef } from './software-ecology.types';

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

export interface Topology {
  readonly B: Bundle;
  readonly nodes: ReadonlyMap<string, TopoNode>;
  readonly edges: readonly TopoBelt[];
  readonly cust: TopoNode;
  readonly centers: readonly TopoNode[];
  readonly order: readonly string[];
}

export interface FloorList<T> {
  readonly n: number;
  at(i: number): T;
}

export interface FloorDoc extends DocMarks {
  readonly c: number;
  readonly t0: number;
  readonly t1: number;
}

export interface FloorRun extends DocMarks {
  readonly c: number;
}

export interface FloorBelt extends TopoBelt {
  readonly rate: number;
  readonly fwd: FloorList<FloorDoc>;
  readonly back: FloorList<FloorDoc>;
}

export interface FloorWork {
  busy: boolean;
  blocked: boolean;
  start: number;
  end: number;
  bounce: boolean;
  stampGood: boolean;
  doc: DocMarks;
}

export interface FloorStation {
  readonly node: TopoNode;
  readonly ins: readonly FloorBelt[];
  readonly waiting: number;
  readonly weeksWaiting: number;
  readonly queue: FloorList<FloorRun>;
  readonly work: FloorWork | null;
  readonly ai: boolean;
}

export interface Floor {
  readonly t: number;
  readonly seed: number;
  readonly belts: readonly FloorBelt[];
  readonly stations: readonly FloorStation[];
  station(id: string): FloorStation | undefined;
  belt(key: string): FloorBelt | undefined;
}

export type FloorEvent = 'request' | 'arrive' | 'front' | 'own' | 'start' | 'done';
export interface FloorAt {
  readonly belt: FloorBelt;
  readonly x: FloorDoc | number;
}
export type FloorListener = (what: FloorEvent, station: FloorStation | null, at?: FloorAt) => void;
