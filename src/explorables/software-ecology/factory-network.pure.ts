// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { perKind } from './defect.pure.ts';
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
import { streams } from './factory-random.pure.ts';
import { size } from './factory-sizing.pure.ts';
import type { Belt, Factory, FactoryNode, TicketSource } from './factory.types';
import type { Bundle, RoleDef, Settings } from './software-ecology.types';
import { custOf } from './start-settings.pure.ts';

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
  complK: perKind(),
  fu: 0,
  req: 0,
  wip: 0,
  wipAvg: 0,
  mainRate: 0,
  idealOut: 0,
  idealOwn: 0,
  idealReq: 0,
});

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
