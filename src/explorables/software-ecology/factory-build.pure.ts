/*
 * Builds the factory network from a use case (design-ADR 0024 §1, §5): one node per work center and the Customer,
 * one belt per from-to pair the Customer or a spawn rule names, loops found by depth-first search, spawn rules resolved
 * to belts, one server per work center or per person. It knows who hands work to whom, never where anything is drawn.
 */
import { kindChancesOf, kindTargets } from './defect.pure.ts';
import { HANDOFF } from './factory-dials.pure.ts';
import { Job } from './factory-docs.pure.ts';
import { Ring, streams } from './factory-random.pure.ts';
import type { Belt, BeltKind, CustomerNode, FactoryNode, NodeKind, Server, SpawnRule } from './factory.types';
import type { Bundle, CenterDef, RoleDef, UseCaseData } from './software-ecology.types';

export interface Pair {
  readonly from: string;
  readonly to: string;
  readonly kind: BeltKind;
  readonly k: string;
}

/** Every Customer target a file or its presets name: mix, good and bad follow-ups. */
const custTargets = (uc: UseCaseData): string[] => {
  const t = new Set<string>();
  for (const c of [uc.customer, ...uc.presets.map((p) => p.customer ?? {})])
    for (const to of [...Object.keys(c.mix ?? {}), ...Object.keys(c.good ?? {}), ...kindTargets(kindChancesOf(c.bad))])
      t.add(to);
  return [...t];
};

const spawnTargets = (c: CenterDef): string[] =>
  c.spawns.flatMap((sp) => (sp.choose ? sp.choose.map((ch) => ch.to) : [sp.to ?? '']));

/** The belts of a use case as from-to pairs, in build order: Customer targets first, then every spawn's. */
export const beltsOf = (uc: UseCaseData): Pair[] => {
  const pairs: Pair[] = [],
    seen = new Set<string>();
  const pair = (from: string, to: string, kind: BeltKind) => {
    const k = `${from}-${to}`;
    if (!seen.has(k)) {
      seen.add(k);
      pairs.push({ from, to, kind, k });
    }
  };
  for (const to of custTargets(uc)) pair('customer', to, 'src');
  for (const c of uc.centers) for (const to of spawnTargets(c)) pair(c.id, to, to === 'customer' ? 'ship' : 'role');
  return pairs;
};

interface NodeSpec {
  readonly def: Partial<CenterDef> & { readonly id: string; readonly at: readonly [number, number] };
  readonly kind: NodeKind;
  readonly role: RoleDef;
}

/** A node at index `idx`; its streams are the reference build's `streams(seed, idx + 1)`. */
export const makeNode = (spec: NodeSpec, idx: number, seed: number): FactoryNode => ({
  id: spec.def.id,
  idx,
  kind: spec.kind,
  def: { ...spec.def, x: spec.def.at[0], y: spec.def.at[1], kind: spec.kind },
  role: spec.role,
  roleId: spec.kind === 'role' ? (spec.def.role ?? '') : 'customer',
  origin: (spec.def.origin ?? spec.role.origin) === 'spec' ? 'spec' : 'code',
  ins: [],
  outs: [],
  spawns: [],
  runs: new Ring(),
  L: 0,
  mu: 1,
  muIdeal: 1,
  muQ93: 1,
  idealJobs: 0,
  ...streams(seed, idx + 1),
  rate: { done: 0, arr: 0, back: 0, rwIn: 0, unread: 0, badIn: 0, badPass: 0, out: [0, 0], compl: 0 },
  u: { busy: 0, starved: 0, blocked: 0, fail: 0 },
  Lavg: 0,
  Ws: 0,
  lvl: 0,
  press: 0,
  sign: { rework: -99, churn: -99, unread: -99, complaint: -99 },
  hist: { out: [], good: [], wait: [], L: [] },
  server: null,
});

export const asCustomer = (n: FactoryNode): CustomerNode =>
  Object.assign(n, {
    edgeTo: new Map<string, Belt>(),
    next: 0,
    rateSeen: -1,
    modeSeen: '',
    mixCur: {},
    acc: [{}, {}, {}] as CustomerNode['acc'],
  });

export const makeBelt = (p: Pair, i: number, net: { nodes: Map<string, FactoryNode>; B: Bundle }): Belt => {
  const { nodes, B } = net,
    A = nodes.get(p.from) as FactoryNode,
    Bn = nodes.get(p.to) as FactoryNode,
    rel = B.data.customer.releases;
  const e: Belt = {
    i,
    key: p.k,
    kind: p.kind,
    from: A,
    to: Bn,
    over: !!B.data.routes?.[p.k]?.over,
    loop: false,
    returns: false,
    release: p.kind === 'ship' && (!rel || rel.includes(p.from)),
    fwd: new Ring(),
    back: new Ring(),
    inT: 0,
    backT: 0,
    rate: 0,
    backRate: 0,
    retOn: false,
    T: HANDOFF,
    aiSize: A.kind === 'role' ? (A.role.aiSize ?? 1) : 1,
  };
  A.outs.push(e);
  Bn.ins.push(e);
  return e;
};

/** Loops: a belt that closes a cycle (work flowing back upstream) never carries rework. */
export const markLoops = (nodes: Iterable<FactoryNode>, cust: FactoryNode, edges: Belt[]): void => {
  const state = new Map<FactoryNode, number>();
  const dfs = (n: FactoryNode): void => {
    state.set(n, 1);
    for (const e of n.outs) {
      if (e.to === cust) continue;
      const s = state.get(e.to);
      if (s === 1) e.loop = true;
      else if (!s) dfs(e.to);
    }
    state.set(n, 2);
  };
  dfs(cust);
  for (const n of nodes) if (!state.get(n)) dfs(n);
  for (const e of edges) e.returns = e.kind === 'role' && !e.loop;
};

/** One spawn rule, resolved to belts. */
const resolveSpawn = (c: CenterDef, sp: CenterDef['spawns'][number], edgeOf: (k: string) => Belt): SpawnRule =>
  sp.choose
    ? {
        choose: sp.choose.map((ch) => ({ e: edgeOf(`${c.id}-${ch.to}`), w: ch.w ?? 1 })),
        W: sp.choose.reduce((a, ch) => a + (ch.w ?? 1), 0),
      }
    : { e: edgeOf(`${c.id}-${sp.to}`), n: sp.n, p: sp.p };

/** Spawn rules, resolved to belts; a center's `escalate` rides on its first spawn (`firstSpawn`). */
export const resolveSpawns = (c: CenterDef, edgeOf: (k: string) => Belt): SpawnRule[] => {
  const [first, ...rest] = c.spawns.map((sp) => resolveSpawn(c, sp, edgeOf));
  if (!first || !c.escalate) return first ? [first, ...rest] : [];
  return [{ ...first, pass: { e: edgeOf(`${c.id}-${c.escalate.to}`), under: c.escalate.underPressure } }, ...rest];
};

const newServer = (id: string): Server => ({
  id,
  nodes: [],
  busy: false,
  blocked: false,
  n: null,
  J: new Job(),
  start: 0,
  end: 0,
  bounce: false,
  churn: 1,
  preQ: 1,
  pass: false,
});

/** Servers: one per work center, or one per person who runs several. */
export const makeServers = (centers: FactoryNode[]): Server[] => {
  const servers: Server[] = [],
    byPerson = new Map<string, Server>();
  for (const n of centers) {
    const p = n.def.person;
    let sv = p ? byPerson.get(p) : undefined;
    if (!sv) {
      sv = newServer(p ?? n.id);
      servers.push(sv);
      if (p) byPerson.set(p, sv);
    }
    sv.nodes.push(n);
    n.server = sv;
  }
  return servers;
};

/** Flow order for the compare stream: longest path from the Customer, loops and releases ignored. */
export const flowOrder = (nodes: Map<string, FactoryNode>, edges: Belt[], cust: FactoryNode): string[] => {
  const rank = new Map<string, number>([['customer', 0]]);
  for (let it = 0; it < nodes.size; it++)
    for (const e of edges)
      if (!e.loop && e.to !== cust && rank.has(e.from.id))
        rank.set(e.to.id, Math.max(rank.get(e.to.id) ?? 0, (rank.get(e.from.id) as number) + 1));
  return [...nodes.values()]
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0) || a.def.y - b.def.y)
    .map((n) => n.id);
};
