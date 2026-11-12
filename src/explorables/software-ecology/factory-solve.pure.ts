/*
 * The traffic solve (design-ADR 0024 §4): the expected flows at given settings, the traffic equations of
 * factory-traffic.pure.ts iterated to a fixed point, then each center's load against its capacity.
 */
import { DEFECTS } from './defect.pure.ts';
import { constOf, custOf, dials, mechOf, ownOf, productCo, RUSH_MAX, speedOf } from './factory-dials.pure.ts';
import { NF_, trafficPass, type Ctx, type Pass } from './factory-traffic.pure.ts';
import type { Dials, Factory } from './factory.types';
import type { Settings } from './software-ecology.types';

export interface SolveResult {
  readonly F: Float64Array[];
  readonly load: Float64Array;
  readonly jobs: Float64Array;
  readonly rho: Record<string, number>;
  readonly persons: Record<string, number>;
  readonly out: number;
  readonly own: number;
  readonly relG: number;
  readonly relB: number;
  readonly fu: number;
  readonly req: number;
  readonly gain: number;
  readonly converged: boolean;
  readonly headroom: number;
  readonly sat: number;
}

const sum = (xs: Iterable<number>): number => {
  let a = 0;
  for (const x of xs) a += x;
  return a;
};

const context = (m: Factory, s: Settings, opts: { worst: boolean; rush: boolean }): Ctx => {
  const cu = custOf(m, s),
    complOn = !!s.mech.complaints;
  const D = [...m.nodes.values()].map((n) => {
    if (n.kind !== 'role') return null;
    const d = dials(n, s);
    return opts.rush ? { ...d, effv: Math.max(5, d.effv - RUSH_MAX) } : d;
  });
  return {
    m,
    s,
    D,
    cu,
    rework: mechOf(s, 'rework'),
    churn: Math.max(1, mechOf(s, 'churn') || 1),
    complOn,
    mixW: sum(Object.values(cu.mix)) || 1,
    badP: DEFECTS.map((k) => (complOn ? sum(Object.values(cu.bad[k])) : 0)) as [number, number],
    srcs: productCo(s) ? m.srcs.map((x) => ({ n: x.n, rate: ownOf(x, { s, mode: cu.mode }).rate })) : [],
    worst: opts.worst,
    k: {
      inspect: constOf(s, 'inspect'),
      redo: constOf(s, 'redo'),
      keepExtra: constOf(s, 'keepExtra'),
      maxBounces: constOf(s, 'maxBounces'),
    },
  };
};

const fresh = (m: Factory, F: Float64Array[]): Pass => ({
  F,
  NF: m.edges.map(() => new Float64Array(NF_)),
  R: m.edges.map(() => new Float64Array(18)),
  load: new Float64Array(m.nodes.size),
  jobs: new Float64Array(m.nodes.size),
  out: 0,
  own: 0,
  relG: 0,
  relB: 0,
  relBK: [0, 0],
  fu: 0,
});

const change = (p: Pass): { diff: number; tot: number } => {
  let diff = 0,
    tot = 0;
  for (let i = 0; i < p.NF.length; i++)
    for (let j = 0; j < NF_; j++) {
      diff = Math.max(diff, Math.abs(p.NF[i][j] - p.F[i][j]));
      tot += p.NF[i][j];
    }
  return { diff, tot };
};

const iterate = (ctx: Ctx): { p: Pass; converged: boolean } => {
  let F: Float64Array[] = ctx.m.edges.map(() => new Float64Array(NF_)),
    p = fresh(ctx.m, F);
  for (let it = 0; it < 800; it++) {
    p = fresh(ctx.m, F);
    trafficPass(ctx, p);
    const { diff, tot } = change(p);
    F = p.NF;
    if (diff < 1e-10) return { p: { ...p, F }, converged: true };
    if (!(tot < 1e9)) break;
  }
  return { p: { ...p, F }, converged: false };
};

const loads = (ctx: Ctx, p: Pass): { rho: Record<string, number>; persons: Record<string, number> } => {
  const rho: Record<string, number> = {},
    persons: Record<string, number> = {};
  for (const n of ctx.m.centers) {
    rho[n.id] = p.load[n.idx] / speedOf(n, ctx.D[n.idx] as Dials);
    const who = n.def.person;
    if (who) persons[who] = (persons[who] || 0) + rho[n.id];
  }
  return { rho, persons };
};

/** The expected flows at given settings; `worst` passes all bad work unread and rushes every center (Q114 B). */
export const solve = (m: Factory, s: Settings, opts: { worst?: boolean; rush?: boolean } = {}): SolveResult => {
  const worst = opts.worst ?? false,
    ctx = context(m, s, { worst, rush: opts.rush ?? worst });
  const { p, converged } = iterate(ctx),
    { rho, persons } = loads(ctx, p);
  const req = ctx.cu.rate + p.fu,
    rels = p.relG + p.relB;
  const maxRho = Math.max(
    ...m.centers.filter((n) => !n.def.person).map((n) => rho[n.id]),
    ...Object.values(persons),
    1e-9,
  );
  return {
    F: p.F,
    load: p.load,
    jobs: p.jobs,
    rho,
    persons,
    out: p.out,
    own: p.own,
    relG: p.relG,
    relB: p.relB,
    fu: p.fu,
    req,
    gain: req > 0 ? p.fu / req : 0,
    converged,
    headroom: 1 / maxRho,
    sat: rels > 0 ? Math.max(0, p.relG - p.relBK[0] * ctx.badP[0] - p.relBK[1] * ctx.badP[1]) / rels : 1,
  };
};
