// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { DEFECTS } from './defect.pure.ts';
import { catchOf, srcRate } from './factory-dials.pure.ts';
import type { Belt, Dials, Factory, FactoryNode, TicketSource } from './factory.types';
import { firstSpawn } from './first-spawn.pure.ts';
import { cells, fi, type Indexed } from './flow-cells.pure.ts';
import type { Cust, Defect, Settings } from './software-ecology.types';

const ALL = cells([0, 1, 2]);
const CARRYING = cells([1, 2]);
const REDO = [0, 1].flatMap((f) =>
  [1, 2].flatMap((b) => [0, 1, 2].map((mn) => ({ q: 0, f, b, mn, i: f * 9 + b * 3 + mn }))),
);
const REQUEST = fi({ q: 1, f: 0, b: 0, mn: 1 });
const COMPLAINT = fi({ q: 1, f: 1, b: 0, mn: 1 });

export interface Ctx {
  readonly m: Factory;
  readonly s: Settings;
  readonly D: (Dials | null)[];
  readonly cu: Cust;
  readonly churn: number;
  readonly complOn: boolean;
  readonly mixW: number;
  readonly badP: Readonly<Record<Defect, number>>;
  readonly srcs: readonly Pick<TicketSource, 'n' | 'rate'>[];
  readonly worst: boolean;
  readonly consts: {
    readonly redo: number;
    readonly keepExtra: number;
    readonly maxBounces: number;
  };
}

export interface Pass {
  F: Float64Array[];
  NF: Float64Array[];
  R: Float64Array[];
  load: Float64Array;
  jobs: Float64Array;
  out: number;
  own: number;
  relG: number;
  relB: number;
  relBK: Record<Defect, number>;
  fu: number;
}

interface Flow {
  readonly n: FactoryNode;
  readonly d: Dials;
  readonly r: number;
  readonly qIn: number;
  readonly f: number;
  readonly mn: number;
  readonly mult: number;
  readonly kind: Defect;
}

const dialsOf = (ctx: Ctx, n: FactoryNode): Dials => ctx.D[n.idx] as Dials;

const addFulfilled = (p: Pass, mn: number, r: number): void => {
  if (mn === 1) p.out += r;
  else p.own += r;
};

const received = (p: Pass, x: { e: Belt; c: Indexed; r: number }): void => {
  const { c, r } = x,
    fulfilled = c.q && !c.f;
  if (fulfilled) addFulfilled(p, c.mn, r);
  if (!x.e.release) return;
  if (c.q) p.relG += r;
  else {
    p.relB += r;
    p.relBK[c.kind] += r;
  }
};

const customerIn = (ctx: Ctx, p: Pass): void => {
  for (const e of ctx.m.cust.ins)
    for (const c of CARRYING) {
      const r = p.F[e.i][c.i];
      if (r) received(p, { e, c, r });
    }
};

const customerOut = (ctx: Ctx, p: Pass): void => {
  const { cu, m } = ctx,
    belt = (to: string) => p.NF[(m.cust.edgeTo.get(to) as Belt).i];
  for (const [to, w] of Object.entries(cu.mix)) belt(to)[REQUEST] += (cu.rate * w) / ctx.mixW;
  for (const [to, x] of Object.entries(cu.good)) {
    belt(to)[REQUEST] += p.relG * x;
    p.fu += p.relG * x;
  }
  if (!ctx.complOn) return;
  for (const kind of DEFECTS)
    for (const [to, x] of Object.entries(cu.bad[kind])) {
      belt(to)[COMPLAINT] += p.relBK[kind] * x;
      p.fu += p.relBK[kind] * x;
    }
};

const targets = (sp: FactoryNode['spawns'][number]): [number, number, boolean][] =>
  sp.choose
    ? sp.choose.map((c) => [c.e.i, c.w / (sp.W as number), true])
    : [[(sp.e as Belt).i, sp.n ?? sp.p ?? 1, false]];

const spawnTo = (p: Pass, w: Flow, x: { ei: number; share: number; main: number; gq: number }): void => {
  const docs = w.r * x.share * w.mult,
    rest = Math.max(0, docs - x.main),
    A = p.NF[x.ei];
  A[fi({ q: 1, f: w.f, b: 0, mn: w.mn })] += x.main * x.gq;
  A[fi({ kind: w.kind, q: 0, f: w.f, b: 0, mn: w.mn })] += x.main * (1 - x.gq);
  A[fi({ q: 1, f: w.f, b: 0, mn: 0 })] += rest * x.gq;
  A[fi({ kind: w.kind, q: 0, f: w.f, b: 0, mn: 0 })] += rest * (1 - x.gq);
};

const spawnOut = (p: Pass, w: Flow): void => {
  const gq = w.qIn ? w.d.effv / 100 : 0;
  const first = firstSpawn(w.n.spawns);
  w.n.spawns.forEach((sp) => {
    for (const [ei, share, ch] of targets(sp)) {
      const main = w.mn && sp === first ? (ch ? w.r * share : w.r) : 0;
      spawnTo(p, w, { ei, share, main, gq });
    }
  });
};

const ownTickets = (ctx: Ctx, p: Pass): void => {
  for (const src of ctx.srcs) {
    const n = src.n,
      d = dialsOf(ctx, n),
      r = srcRate(src.rate, d);
    p.load[n.idx] += r;
    p.jobs[n.idx] += r;
    spawnOut(p, { n, d, r, qIn: 1, f: 0, mn: 2, mult: d.fanEff, kind: n.origin });
  }
};

interface Arrival {
  readonly n: FactoryNode;
  readonly d: Dials;
  readonly e: Belt;
  readonly sz: number;
  readonly c: Indexed;
  readonly r: number;
}

const backShare = (ctx: Ctx, a: Arrival): number => {
  if (!(a.e.returns && a.c.b < ctx.consts.maxBounces)) return 0;
  if (a.n.def.inspection && ctx.worst) return 0;
  return catchOf(ctx.s, { n: a.n, d: a.d }, a.c.kind);
};

const arriveBad = (ctx: Ctx, p: Pass, a: Arrival): void => {
  const { n, d, e, sz, c, r } = a,
    Bk = r * backShare(ctx, a),
    kept = r - Bk;
  p.load[n.idx] += Bk * ctx.consts.redo * sz;
  if (Bk) p.R[e.i][c.f * 9 + Math.min(2, c.b + 1) * 3 + c.mn] += Bk;
  const insp = !!n.def.inspection;
  p.load[n.idx] += insp ? kept * sz : kept * sz * (1 + ctx.consts.keepExtra);
  spawnOut(p, { n, d, r: kept, qIn: 0, f: c.f, mn: c.mn, mult: insp ? d.fanEff : d.fanEff * ctx.churn, kind: c.kind });
};

const arrive = (ctx: Ctx, p: Pass, a: Arrival): void => {
  p.jobs[a.n.idx] += a.r;
  if (a.c.q !== 1 && a.e.kind !== 'src') return arriveBad(ctx, p, a);
  p.load[a.n.idx] += a.r * a.sz;
  spawnOut(p, { n: a.n, d: a.d, r: a.r, qIn: 1, f: a.c.f, mn: a.c.mn, mult: a.d.fanEff, kind: a.n.origin });
};

const beltIn = (ctx: Ctx, p: Pass, x: { n: FactoryNode; e: Belt }): void => {
  const { n, e } = x,
    d = dialsOf(ctx, n),
    sz = e.from.kind === 'role' && dialsOf(ctx, e.from).ai ? e.aiSize : 1;
  for (const c of ALL) {
    const r = p.F[e.i][c.i];
    if (r) arrive(ctx, p, { n, d, e, sz, c, r });
  }
};

const redoFlows = (ctx: Ctx, p: Pass): void => {
  for (const e of ctx.m.edges)
    for (const c of REDO) {
      const r = p.R[e.i][c.i];
      if (!r) continue;
      const sn = e.from,
        g = dialsOf(ctx, sn).effv / 100;
      p.load[sn.idx] += r;
      p.jobs[sn.idx] += r;
      p.NF[e.i][fi({ ...c, q: 1 })] += r * g;
      p.NF[e.i][fi({ ...c, kind: sn.origin, q: 0 })] += r * (1 - g);
    }
};

export const trafficPass = (ctx: Ctx, p: Pass): void => {
  customerIn(ctx, p);
  customerOut(ctx, p);
  ownTickets(ctx, p);
  for (const n of ctx.m.centers) for (const e of n.ins) beltIn(ctx, p, { n, e });
  redoFlows(ctx, p);
};
