// The factory model's shapes (design-ADR 0024 §1–§5): its network, work centers, belts, servers and documents.
import type { Job, Run, Token } from './factory-docs.pure.ts';
import type { Ring, Streams } from './factory-random.pure.ts';
import type { Arrivals, Bundle, CenterDef, Cust, Defect, Dials, RoleDef, Settings } from './software-ecology.types';
export type { Streams } from './factory-random.pure.ts';

export { Job, Run, Token } from './factory-docs.pure.ts';

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
  /** Bad inputs a week it judged, and those it passed on unflagged. */
  badIn: number;
  badPass: number;
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
  /** The defect kind it makes: the center's `origin`, else its role's. */
  readonly origin: Defect;
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
  /** Turns of the follow-ups in Ideal: a bad release's of a spec defect, a good release's, a bad release's of a code defect. */
  acc: [Record<string, number>, Record<string, number>, Record<string, number>];
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
  readonly arrivals?: Arrivals;
  next: number;
  seen: number;
  modeSeen: string;
}

export type { Dials } from './software-ecology.types';

/** What the painter hears: a request, an arrival, a job started or done; `at` names the belt and the token or time. */
export type Hook = (what: string, n: FactoryNode, at?: { readonly belt: Belt; readonly x: Token | number }) => void;

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
  /** Complaints a week by defect kind: change requests (spec) and bugs (code). */
  complK: Record<Defect, number>;
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
