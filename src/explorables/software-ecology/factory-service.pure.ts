/*
 * Service in the factory model (design-ADR 0024 §1, §3): event-time completion inside a step. A server picks the next
 * job, rolls its result as work starts (so the station can stamp it as the job ends), and on finishing sends it back,
 * hands on its spawns, or blocks while the next center's buffer is full.
 */
import type { Defect } from './defect.types';
import {
  catches,
  catchOf,
  CV,
  effvNow,
  firstOf,
  mechOf,
  pressureOf,
  Q,
  speedOf,
  stallOf,
} from './factory-dials.pure.ts';
import { kindBit, kindOf } from './factory-docs.pure.ts';
import { BUMP, FAIL, FROM_SRC, MAIN, OWN, popJob, REDO, send, sendBack } from './factory-flow.pure.ts';
import { binom, expo, normal } from './factory-random.pure.ts';
import { countOf, passesOn, pickBelt, type Pick } from './factory-routing.pure.ts';
import type { Belt, Dials, Factory, FactoryNode, Job, Server, SpawnRule } from './factory.types';
import { constOf } from './mechanics.pure.ts';

const pickCenter = (sv: Server): FactoryNode | null => {
  if (sv.nodes.length === 1) return sv.nodes[0].L ? sv.nodes[0] : null;
  let best: FactoryNode | null = null,
    bw = -1;
  for (const n of sv.nodes) {
    const w = n.L ? n.L / n.mu : -1;
    if (w > bw) {
      bw = w;
      best = n;
    }
  }
  return best;
};

const serviceTime = (m: Factory, n: FactoryNode, mean: number): number => {
  if (m.s.reality === 0) return mean;
  if (n.def.service === 'exponential') return expo(n.rs, mean);
  return Math.max(0.1 * mean, mean * (1 + CV * normal(n.rs)));
};

interface Verdict {
  readonly bounce: boolean;
  readonly churn: number;
  /** What the job's size is multiplied by: `redo` to send it back, 1 + `keepExtra` to keep and fix a bad input. */
  readonly grow: number;
}
const AS_IS: Verdict = { bounce: false, churn: 1, grow: 1 };

interface Judged {
  readonly elig: boolean;
  readonly t: number;
  /** The station's catch of the arriving kind. */
  readonly chance: number;
}

/** An inspection sends bad work back, but passes more of it unread as its backlog fills. */
const inspect = (m: Factory, n: FactoryNode, x: Judged): Verdict => {
  const p0 = x.elig ? x.chance : 0,
    k = 1 - pressureOf(m.s, n, firstOf(n.def.stampUnderPressure, 0.8)),
    r = n.rr();
  const bounce = r < p0 * k;
  if (!bounce && r < p0) {
    n.rate.unread += BUMP;
    n.sign.unread = x.t;
  }
  return bounce ? { ...AS_IS, bounce, grow: constOf(m.s, 'redo') } : AS_IS;
};

/** A plain work center sends bad input back by chance; kept, it multiplies (churn) and takes longer. */
const keepOrSendBack = (m: Factory, n: FactoryNode, x: Judged): Verdict => {
  if (x.elig && n.rr() < x.chance) return { bounce: true, churn: 1, grow: constOf(m.s, 'redo') };
  const c = mechOf(m.s, 'churn');
  if (c > 1) n.sign.churn = x.t;
  return { bounce: false, churn: c > 1 ? c : 1, grow: 1 + constOf(m.s, 'keepExtra') };
};

/** Counts a bad input for the unread share: only of the kinds this station's catch can catch (grill 11 Q219). */
const countBad = (m: Factory, n: FactoryNode, x: { kind: Defect; bounce: boolean }): void => {
  if (!catches(m.s, n, x.kind)) return;
  n.rate.badIn += BUMP;
  if (!x.bounce) n.rate.badPass += BUMP;
};

/** What a work center does with the job it starts: work on it as it is, send it back, or keep a bad input. */
const verdictOf = (m: Factory, n: FactoryNode, x: { e: Belt; t: number }): Verdict => {
  const J = (n.server as Server).J;
  if (J.q !== Q.BAD || J.fl & (FROM_SRC | REDO)) return AS_IS;
  const kind = kindOf(J.fl, x.e.from.origin),
    elig = x.e.returns && J.b < constOf(m.s, 'maxBounces'),
    chance = catchOf(m.s, { n, d: m.dc[n.idx] }, kind);
  const v = n.def.inspection ? inspect(m, n, { elig, t: x.t, chance }) : keepOrSendBack(m, n, { elig, t: x.t, chance });
  countBad(m, n, { kind, bounce: v.bounce });
  return v;
};

/** The result is rolled when work starts, so the station can stamp it as the job ends. */
const rollQuality = (n: FactoryNode, d: Dials, J: Job): number => {
  const fresh = !!(J.fl & (REDO | FROM_SRC)) || J.q === Q.GOOD;
  return fresh && n.rq() < effvNow(n, d) ? Q.GOOD : Q.BAD;
};

/** A ticket is passed on unanswered under pressure (`passesOn`), never redone work or work it sends back. */
const passing = (m: Factory, x: { n: FactoryNode; J: Job; v: Verdict }): boolean =>
  !x.v.bounce && !(x.J.fl & REDO) && passesOn(m.s, x.n);

const startJob = (m: Factory, sv: Server, x: { n: FactoryNode; t: number }): void => {
  const { n, t } = x,
    J = sv.J,
    d = m.dc[n.idx];
  popJob(n, J);
  const e = m.edges[J.e],
    v = verdictOf(m, n, { e, t });
  sv.pass = passing(m, { n, J, v });
  const grow = sv.pass ? constOf(m.s, 'redo') : v.grow;
  const size = (J.fl & (REDO | FROM_SRC) ? 1 : J.ai ? e.aiSize : 1) * grow;
  sv.preQ = rollQuality(n, d, J);
  sv.n = n;
  sv.bounce = v.bounce;
  sv.churn = v.churn;
  sv.busy = true;
  sv.start = t;
  sv.end = t + serviceTime(m, n, size / (speedOf(n, d) * (1 - stallOf(n, d))));
  m.hook?.('start', n);
};

const roomFor = (n: FactoryNode): boolean =>
  n.outs.every((e) => !(e.to.kind === 'role' && e.to.def.buffer && e.to.L + e.inT >= e.to.def.buffer));

interface Hand {
  readonly sv: Server;
  readonly d: Dials;
  readonly t: number;
  readonly qIn: number;
  readonly fl: number;
  readonly main: number;
  readonly ai: number;
  /** The defect flag of what it hands on bad: a kept bad input's kind, else the center's own. */
  readonly kind: number;
}

/** The first spawn's first document carries the request on, with the result rolled at the start. */
const carryOn = (m: Factory, h: Hand, e: Belt): void => {
  const n = h.sv.n as FactoryNode;
  send(m, e, { c: 1, q: h.sv.preQ, ai: h.ai, fl: h.fl | h.main | (h.sv.preQ === Q.BAD ? h.kind : 0), b: 0, t0: h.t });
  n.rate.out[h.sv.preQ] += BUMP;
};

/** The other documents a spawn hands on, each good with the center's effectiveness when its input was good. */
const besides = (m: Factory, h: Hand, x: { e: Belt; k: number }): void => {
  const n = h.sv.n as FactoryNode,
    { e, k } = x;
  const g = h.qIn === Q.GOOD ? binom(n.rq, k, effvNow(n, h.d)) : 0;
  send(m, e, { c: g, q: Q.GOOD, ai: h.ai, fl: h.fl, b: 0, t0: h.t });
  send(m, e, { c: k - g, q: Q.BAD, ai: h.ai, fl: h.fl | h.kind, b: 0, t0: h.t });
  n.rate.out[1] += g * BUMP;
  n.rate.out[0] += (k - g) * BUMP;
};

/** Where a spawn goes: the pass-on belt for a ticket passed on unanswered, else as the spawn routes it. */
const beltFor = (h: Hand, x: { sp: SpawnRule; j: number; steady: boolean }): Pick => {
  const pass = x.j === 0 && h.sv.pass ? x.sp.pass : undefined;
  return pass ? { e: pass.e, base: 1 } : pickBelt(h.sv.n as FactoryNode, x.sp, x.steady);
};

const handOn = (m: Factory, h: Hand, x: { sp: SpawnRule; j: number }): void => {
  const n = h.sv.n as FactoryNode,
    steady = m.s.reality === 0;
  const { e, base } = beltFor(h, { ...x, steady });
  if (!base) return;
  const k = countOf(n, x.sp, { f: base * h.d.fanEff * h.sv.churn, steady });
  if (!k) return;
  const first = x.j === 0 ? 1 : 0;
  if (first) carryOn(m, h, e);
  if (k - first) besides(m, h, { e, k: k - first });
};

/** A job judged bad at the start rides back to its sender. */
const bounceBack = (m: Factory, sv: Server, t: number): void => {
  const n = sv.n as FactoryNode;
  sendBack(m, m.edges[sv.J.e], { J: sv.J, t0: t });
  n.rate.back += BUMP;
  n.sign.rework = t;
  m.hook?.('done', n);
};

/** Redone work goes back out on the belt it came on. */
const redone = (m: Factory, sv: Server, x: { t: number; ai: number }): void => {
  const n = sv.n as FactoryNode,
    J = sv.J;
  const fl = (J.fl & (FAIL | MAIN | OWN)) | (sv.preQ === Q.BAD ? kindBit(n.origin) : 0);
  send(m, m.edges[J.e], { c: 1, q: sv.preQ, ai: x.ai, fl, b: J.b, t0: x.t });
  n.rate.out[sv.preQ] += BUMP;
};

/** The defect flag of what a center hands on bad: a kept bad input's first cause, else its own kind. */
const badKind = (m: Factory, n: FactoryNode, qIn: number): number => {
  const J = (n.server as Server).J;
  return kindBit(qIn === Q.BAD ? kindOf(J.fl, m.edges[J.e].from.origin) : n.origin);
};

const finish = (m: Factory, sv: Server, t: number): boolean => {
  const n = sv.n as FactoryNode,
    J = sv.J,
    d = m.dc[n.idx];
  if (sv.bounce) return (bounceBack(m, sv, t), true);
  if (!roomFor(n)) return false;
  m.consumed++;
  n.rate.done += BUMP;
  m.hook?.('done', n);
  const ai = d.ai ? 1 : 0;
  if (J.fl & REDO) return (redone(m, sv, { t, ai }), true);
  const qIn = J.fl & FROM_SRC ? Q.GOOD : J.q;
  const h: Hand = { sv, d, t, ai, qIn, fl: J.fl & FAIL, main: J.fl & (MAIN | OWN), kind: badKind(m, n, qIn) };
  n.spawns.forEach((sp, j) => handOn(m, h, { sp, j }));
  return true;
};

/** Finishes what the server holds when it ends by t1; false when it must wait (still working, or blocked). */
const settle = (m: Factory, sv: Server, x: { t: number; t1: number }): number | null => {
  if (sv.blocked) {
    if (!finish(m, sv, x.t)) return null;
    sv.blocked = false;
    sv.busy = false;
  }
  if (!sv.busy) return x.t;
  if (sv.end > x.t1) return null;
  const t = sv.end;
  sv.blocked = !finish(m, sv, t);
  if (sv.blocked) return null;
  sv.busy = false;
  return t;
};

/** Runs one server from t0 to t1: finishes what ends inside, starts the next job, blocks when the next buffer is full. */
export const runServer = (m: Factory, sv: Server, span: { t0: number; t1: number }): void => {
  let t: number | null = span.t0;
  for (let guard = 0; guard < 2000; guard++) {
    t = settle(m, sv, { t, t1: span.t1 });
    if (t === null) return;
    const n = pickCenter(sv);
    sv.n = n;
    if (!n) return;
    startJob(m, sv, { n, t });
  }
};
