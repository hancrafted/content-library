/*
 * The factory network of a use case (design-ADR 0024 §1, §5): its nodes, belts, servers and own-ticket sources, its
 * counters at day 0, sized for its settings. Model-internal: `createFactory` wraps it; the model's own tests reach it
 * through `buildFactory`, its internal seam.
 */
import {
  asCustomer,
  beltsOf,
  flowOrder,
  makeBelt,
  makeNode,
  makeServers,
  markLoops,
  resolveSpawns,
} from './factory-build.pure.ts';
import { custOf } from './factory-dials.pure.ts';
import { streams } from './factory-random.pure.ts';
import { size } from './factory-sizing.pure.ts';
import type { Belt, Factory, FactoryNode, TicketSource } from './factory.types';
import type { Bundle, RoleDef, Settings } from './software-ecology.types';

export const DEFAULT_SEED = 20261111;

const network = (B: Bundle, seed: number) => {
  const uc = B.data,
    nodes = new Map<string, FactoryNode>();
  const cust = asCustomer(
    makeNode({ def: { ...uc.customer, id: 'customer' }, kind: 'customer', role: B.roles.customer as RoleDef }, 0, seed),
  );
  nodes.set('customer', cust);
  uc.centers.forEach((c, i) =>
    nodes.set(c.id, makeNode({ def: c, kind: 'role', role: B.roles[c.role] as RoleDef }, i + 1, seed)),
  );
  const edges = beltsOf(uc).map((p, i) => makeBelt(p, i, { nodes, B }));
  markLoops(nodes.values(), cust, edges);
  const byKey = new Map(edges.map((e) => [e.key, e]));
  for (const c of uc.centers) (nodes.get(c.id) as FactoryNode).spawns = resolveSpawns(c, (k) => byKey.get(k) as Belt);
  cust.edgeTo = new Map(cust.outs.map((e) => [e.to.id, e]));
  return { nodes, edges, cust };
};

const sources = (B: Bundle, nodes: Map<string, FactoryNode>, seed: number): TicketSource[] =>
  (B.data.sources ?? []).map((x, i) => ({
    id: x.id,
    n: nodes.get(x.at) as FactoryNode,
    rate: x.rate,
    arrivals: x.arrivals,
    next: Infinity,
    seen: -1,
    modeSeen: '',
    ...streams(seed, 200 + i),
  }));

/** The clock, counters and averages of a model at day 0. */
const counters = () => ({
  pool: [] as Factory['pool'],
  t: 0,
  sampleAt: 0,
  tokens: 0,
  overflow: 0,
  shelf: [] as Factory['shelf'],
  created: 0,
  consumed: 0,
  dc: [] as Factory['dc'],
  hook: null as Factory['hook'],
  outRate: 0,
  outN: 0,
  ownRate: 0,
  ownN: 0,
  arrRate: 0,
  rel: [0, 0] as [number, number],
  compl: 0,
  fu: 0,
  req: 0,
  wip: 0,
  wipAvg: 0,
  mainRate: 0,
  idealOut: 0,
  idealOwn: 0,
  idealReq: 0,
});

/**
 * Builds the network of a use case at the given settings, sized, empty at day 0. The model's internal seam: its own
 * tests reach the network through it; everything else goes through `createFactory`.
 */
export const buildFactory = (B: Bundle, s: Settings, seed: number = DEFAULT_SEED): Factory => {
  const { nodes, edges, cust } = network(B, seed);
  const centers = [...nodes.values()].filter((n) => n.kind === 'role');
  const m: Factory = {
    B,
    seed,
    s,
    nodes,
    edges,
    cust,
    servers: makeServers(centers),
    order: flowOrder(nodes, edges, cust),
    srcs: sources(B, nodes, seed),
    centers,
    ...counters(),
    cs: custOf({ B }, s),
  };
  size(m);
  return m;
};
