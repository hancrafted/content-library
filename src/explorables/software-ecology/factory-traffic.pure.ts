/*
 * One pass of the traffic equations (design-ADR 0024 §4), which factory-solve.pure.ts iterates to a fixed point. A flow
 * cell holds documents a week by a bad document's defect kind (spec or code; a good one counts as spec), quality (bad 0, good 1),
 * failure demand (0, 1), times sent back (0..2) and what the document carries (0 nothing, 1 a customer request, 2 an own
 * ticket). The loops run in the reference build's order, kind outermost, so a run without bad work adds in the same order
 * and the numbers match to the last bit.
 */
import { DEFECTS } from './defect.pure.ts';
import { catchOf, srcRate } from './factory-dials.pure.ts';
import type { Belt, Dials, Factory, FactoryNode, TicketSource } from './factory.types';
import type { Cust, Defect, Settings } from './software-ecology.types';

export const NF_ = 72;
/** The cells of one defect kind: the first half of a belt's cells is spec, the second code. */
const KIND_CELLS = NF_ / 2;

export interface Cell {
  /** A bad document's defect kind; a good one has none. */
  readonly kind?: Defect;
  readonly q: number;
  readonly f: number;
  readonly b: number;
  readonly mn: number;
}
/** The index of a flow cell. */
export const fi = (c: Cell): number => (c.kind === 'code' ? KIND_CELLS : 0) + ((c.q * 2 + c.f) * 3 + c.b) * 3 + c.mn;

type Indexed = Cell & { readonly kind: Defect; readonly i: number };
const cells = (mns: readonly number[]): Indexed[] =>
  DEFECTS.flatMap((kind) =>
    [0, 1].flatMap((q) =>
      [0, 1].flatMap((f) =>
        [0, 1, 2].flatMap((b) => mns.map((mn) => ({ kind, q, f, b, mn, i: fi({ kind, q, f, b, mn }) }))),
      ),
    ),
  );
const ALL = cells([0, 1, 2]);
const CARRYING = cells([1, 2]);
const REDO = [0, 1].flatMap((f) =>
  [1, 2].flatMap((b) => [0, 1, 2].map((mn) => ({ q: 0, f, b, mn, i: f * 9 + b * 3 + mn }))),
);
const REQUEST = fi({ q: 1, f: 0, b: 0, mn: 1 });
const COMPLAINT = fi({ q: 1, f: 1, b: 0, mn: 1 });

/** What a pass reads: the model, each center's dials, the Customer, the mechanics' strengths. */
export interface Ctx {
  readonly m: Factory;
  readonly s: Settings;
  readonly D: (Dials | null)[];
  readonly cu: Cust;
  readonly rework: number;
  readonly churn: number;
  readonly complOn: boolean;
  readonly mixW: number;
  /** The chance a bad release brings a complaint, per defect kind. */
  readonly badP: Readonly<Record<Defect, number>>;
  readonly srcs: readonly Pick<TicketSource, 'n' | 'rate'>[];
  readonly worst: boolean;
  /** The file's constants (design-ADR 0024 §5). */
  readonly consts: {
    readonly inspect: number;
    readonly redo: number;
    readonly keepExtra: number;
    readonly maxBounces: number;
  };
}

/** One pass: the flows it reads (F) and writes (NF), redo jobs per belt (R), each node's load and jobs. */
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
  /** Bad releases per defect kind. */
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
  /** The defect kind of the bad documents it hands on. */
  readonly kind: Defect;
}

const dialsOf = (ctx: Ctx, n: FactoryNode): Dials => ctx.D[n.idx] as Dials;

/** A fulfilled request counts as output; an own ticket apart. */
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

/** What reached the Customer: fulfilled requests, own tickets, good and bad releases. */
const customerIn = (ctx: Ctx, p: Pass): void => {
  for (const e of ctx.m.cust.ins)
    for (const c of CARRYING) {
      const r = p.F[e.i][c.i];
      if (r) received(p, { e, c, r });
    }
};

/** The Customer's new requests, and follow-ups from the releases it received. */
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

/** Where one spawn rule sends a node's work: [belt index, share, whether it is a choice]. */
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
  w.n.spawns.forEach((sp, j) => {
    for (const [ei, share, ch] of targets(sp)) {
      const main = w.mn && j === 0 ? (ch ? w.r * share : w.r) : 0;
      spawnTo(p, w, { ei, share, main, gq });
    }
  });
};

/** Own tickets: written at the role itself, then handed on like a request. */
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

/** The share of bad documents arriving on a belt that are sent back: the station's catch of their kind. */
const backShare = (ctx: Ctx, a: Arrival): number => {
  if (!(a.e.returns && a.c.b < ctx.consts.maxBounces)) return 0;
  if (a.n.def.inspection && ctx.worst) return 0;
  return catchOf(ctx.s, { n: a.n, d: a.d }, a.c.kind);
};

/** Bad documents arriving: some sent back, the rest kept and worked on longer (an inspection: as long as good ones). */
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

/** Redo jobs: the sender does the work again and hands on the same document, rolled afresh. */
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

/** One pass of the traffic equations, reading p.F and writing everything else in p. */
export const trafficPass = (ctx: Ctx, p: Pass): void => {
  customerIn(ctx, p);
  customerOut(ctx, p);
  ownTickets(ctx, p);
  for (const n of ctx.m.centers) for (const e of n.ins) beltIn(ctx, p, { n, e });
  redoFlows(ctx, p);
};
