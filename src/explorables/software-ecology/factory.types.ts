// The factory model's shapes (design-ADR 0024 §1–§5): its network, work centers, belts, servers and documents.
import type { Ring, Streams } from './factory-random.pure.ts';
import type { Bundle, CenterDef, Cust, RoleDef, Settings } from './software-ecology.types';
export type { Streams } from './factory-random.pure.ts';

/** A run of identical jobs waiting at a work center, from one week. */
export interface Run {
  q: number;
  ai: number;
  fl: number;
  e: number;
  b: number;
  wk: number;
  c: number;
}

/** The job a server works on: quality, AI-made, flags, the belt it came on, times sent back. */
export interface Job {
  q: number;
  ai: number;
  fl: number;
  e: number;
  b: number;
}

/** A token on a belt: a count of identical documents, sent at t0, arriving at t1. */
export interface Token {
  c: number;
  q: number;
  ai: number;
  fl: number;
  b: number;
  t0: number;
  t1: number;
  /** When the painter first drew it, in real time; 0 until then. */
  vr: number;
}

/** The documents a send puts on a belt. */
export interface Doc {
  readonly c: number;
  readonly q: number;
  readonly ai: number;
  readonly fl: number;
  readonly b: number;
  readonly t0: number;
}

export interface Rates {
  done: number;
  arr: number;
  back: number;
  rwIn: number;
  unread: number;
  out: [number, number];
  compl: number;
}

export type Use = Record<'busy' | 'starved' | 'blocked' | 'fail', number>;

/** When each sign last fired, in model weeks. */
export type Signs = Record<'rework' | 'churn' | 'unread' | 'complaint', number>;

export interface History {
  out: number[];
  good: (number | null)[];
  wait: number[];
  L: number[];
}

export type NodeDef = Partial<CenterDef> & {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  kind: NodeKind;
};
export type NodeKind = 'customer' | 'role';

export interface ChooseRule {
  readonly e: Belt;
  readonly w: number;
  cur?: number;
}

/** A spawn rule resolved to belts. */
export interface SpawnRule {
  readonly choose?: ChooseRule[];
  readonly W?: number;
  readonly e?: Belt;
  readonly n?: number;
  readonly p?: number;
  acc?: number;
  facc?: number;
}

export interface Server {
  readonly id: string;
  readonly nodes: FactoryNode[];
  busy: boolean;
  blocked: boolean;
  n: FactoryNode | null;
  readonly J: Job;
  start: number;
  end: number;
  bounce: boolean;
  churn: number;
  preQ: number;
}

/** A work center, or the Customer. */
export interface FactoryNode extends Streams {
  readonly id: string;
  readonly idx: number;
  readonly kind: NodeKind;
  readonly def: NodeDef;
  readonly role: RoleDef;
  readonly roleId: string;
  readonly ins: Belt[];
  readonly outs: Belt[];
  spawns: SpawnRule[];
  readonly runs: Ring<Run>;
  L: number;
  mu: number;
  muIdeal: number;
  muQ93: number;
  idealJobs: number;
  readonly rate: Rates;
  readonly u: Use;
  Lavg: number;
  Ws: number;
  lvl: number;
  press: number;
  readonly sign: Signs;
  readonly hist: History;
  server: Server | null;
}

/** The Customer's own state on top of a node: where each target's belt is, its arrival clock, its turns. */
export interface CustomerNode extends FactoryNode {
  edgeTo: Map<string, Belt>;
  next: number;
  rateSeen: number;
  modeSeen: string;
  mixCur: Record<string, number>;
  acc: [Record<string, number>, Record<string, number>];
}

export type BeltKind = 'src' | 'ship' | 'role';

/** A belt: one per from-to pair a Customer target or a spawn rule names. */
export interface Belt {
  readonly i: number;
  readonly key: string;
  readonly kind: BeltKind;
  readonly from: FactoryNode;
  readonly to: FactoryNode;
  readonly over: boolean;
  loop: boolean;
  returns: boolean;
  readonly release: boolean;
  readonly fwd: Ring<Token>;
  readonly back: Ring<Token>;
  inT: number;
  backT: number;
  rate: number;
  backRate: number;
  retOn: boolean;
  readonly T: number;
  readonly aiSize: number;
}

/** A source of own tickets (Product company). */
export interface TicketSource extends Streams {
  readonly id: string;
  readonly n: FactoryNode;
  readonly rate: number;
  next: number;
  seen: number;
  modeSeen: string;
}

/** A work center's dials at the current settings. */
export interface Dials {
  readonly eff: number;
  readonly effv: number;
  readonly base: number;
  readonly ai: boolean;
  readonly fan: number;
  readonly aiSpeed: number;
  readonly aiExtra: number;
  readonly fanEff: number;
  readonly effEff: number;
  readonly en: readonly string[];
}

/** What the painter hears: a request, an arrival, a job started or done; `at` names the belt and the token or time. */
export type Hook = (what: string, n: FactoryNode, at?: { readonly e: Belt; readonly x: Token | number }) => void;

export interface ShelfItem {
  readonly q: number;
  readonly ai: number;
  readonly compl: boolean;
}

/** The whole model state. */
export interface Factory {
  readonly B: Bundle;
  readonly seed: number;
  s: Settings;
  readonly nodes: Map<string, FactoryNode>;
  readonly edges: Belt[];
  readonly cust: CustomerNode;
  readonly servers: Server[];
  /** Node ids in flow order, for the compare stream. */
  readonly order: string[];
  readonly srcs: TicketSource[];
  readonly centers: FactoryNode[];
  readonly pool: Token[];
  t: number;
  sampleAt: number;
  tokens: number;
  overflow: number;
  shelf: ShelfItem[];
  created: number;
  consumed: number;
  dc: Dials[];
  hook: Hook | null;
  outRate: number;
  outN: number;
  ownRate: number;
  ownN: number;
  arrRate: number;
  rel: [number, number];
  compl: number;
  fu: number;
  req: number;
  wip: number;
  wipAvg: number;
  mainRate: number;
  idealOut: number;
  idealOwn: number;
  idealReq: number;
  cs: Cust;
}
