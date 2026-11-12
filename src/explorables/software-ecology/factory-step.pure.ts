/*
 * One step of the factory model (design-ADR 0024 §1): the Customer's requests, own tickets, deliveries off the belts,
 * service, then the averages every readout reads. Fixed steps of DTW weeks; the order of draws is the reference
 * build's, so the same seed gives the same run.
 */
import {
  AMBER,
  custOf,
  dials,
  DTW,
  ownOf,
  productCo,
  Q,
  RED,
  RET_HIDE,
  RET_SHOW,
  speedOf,
  srcRate,
  TAU,
  TAU_OUT,
} from './factory-dials.pure.ts';
import { Run } from './factory-docs.pure.ts';
import { BUMP, deliver, deliverBack, FAIL, FROM_SRC, MAIN, OWN, pushBack, send } from './factory-flow.pure.ts';
import { expo } from './factory-random.pure.ts';
import { runServer } from './factory-service.pure.ts';
import type { Belt, Factory, FactoryNode, Streams, TicketSource } from './factory.types';
import type { Arrivals, Cust } from './software-ecology.types';

const nextGap = (c: Streams, mode: Arrivals, r: number): number => (mode === 'steady' ? 1 / r : expo(c.ra, 1 / r));

/** Smooth weighted round robin: the mix in strict turns. */
const inTurn = (cur: Record<string, number>, ent: [string, number][], W_: number): string => {
  let best = -Infinity,
    pick = '';
  for (const [to, w] of ent) {
    cur[to] = (cur[to] || 0) + w;
    if (cur[to] > best) {
      best = cur[to];
      pick = to;
    }
  }
  cur[pick] -= W_;
  return pick;
};

const byWeight = (ent: [string, number][], r: number): string => {
  for (const [to, w] of ent) {
    if (r < w) return to;
    r -= w;
  }
  return ent[ent.length - 1][0];
};

/** Where the next request goes: the mix in strict turns when steady, by chance when random. */
const pickMix = (m: Factory, cu: Cust): Belt | null => {
  const c = m.cust,
    ent = Object.entries(cu.mix);
  let W_ = 0;
  for (const [, w] of ent) W_ += w;
  if (!W_) return null;
  const to = cu.mode === 'steady' ? inTurn(c.mixCur, ent, W_) : byWeight(ent, c.rr() * W_);
  return c.edgeTo.get(to) ?? null;
};

/** The Customer: requests Steady (one every 1/rate) or Random (Poisson), split by the mix. */
const requests = (m: Factory, t0: number, t1: number): void => {
  const cu = (m.cs = custOf(m, m.s)),
    c = m.cust,
    r = cu.rate;
  if (r !== c.rateSeen || cu.mode !== c.modeSeen) {
    c.rateSeen = r;
    c.modeSeen = cu.mode;
    c.next = r > 0 ? t0 + nextGap(c, cu.mode, r) : Infinity;
  }
  while (c.next <= t1) {
    const e = pickMix(m, cu);
    if (e) {
      send(m, e, { c: 1, q: Q.GOOD, ai: 0, fl: FROM_SRC | MAIN, b: 0, t0: c.next });
      m.wip++;
      m.req += BUMP;
      m.hook?.('request', c, { belt: e, x: c.next });
    }
    c.next += nextGap(c, cu.mode, r);
  }
};

/** One own ticket, written into its role's backlog and announced to the floor; it draws nothing. */
const arrive = (m: Factory, src: TicketSource, wk: number): void => {
  m.created++;
  m.wip++;
  src.n.rate.arr += BUMP;
  pushBack(src.n, new Run({ q: Q.GOOD, ai: 0, fl: FROM_SRC | MAIN | OWN, e: -1, b: 0, wk, c: 1 }));
  m.hook?.('own', src.n);
};

/** One source's own tickets up to t1, written into its role's backlog. */
const tickets = (m: Factory, src: TicketSource, x: { t0: number; t1: number }): void => {
  const n = src.n,
    own = ownOf(src, { s: m.s, mode: m.cs.mode }),
    rs = srcRate(own.rate, m.dc[n.idx]),
    mode = own.arrivals;
  if (rs !== src.seen || mode !== src.modeSeen) {
    src.seen = rs;
    src.modeSeen = mode;
    src.next = rs > 0 ? x.t0 + nextGap(src, mode, rs) : Infinity;
  }
  for (; src.next <= x.t1; src.next += nextGap(src, mode, rs)) arrive(m, src, Math.floor(src.next));
};

/** One own ticket now, as a scheduled one; false for no source or Service provider. Draws nothing, moves no clock. */
export const emitOwn = (m: Factory, id: string): boolean => {
  const src = productCo(m.s) ? m.srcs.find((x) => x.n.id === id) : undefined;
  if (!src) return false;
  arrive(m, src, Math.floor(m.t));
  return true;
};

/** Own tickets (Product company): each source at its own rate and arrivals, its own random stream. */
const ownTickets = (m: Factory, t0: number, t1: number): void => {
  if (!productCo(m.s)) return;
  for (const src of m.srcs) tickets(m, src, { t0, t1 });
};

/** Belts: deliver what has arrived. */
const deliveries = (m: Factory, t1: number): void => {
  for (const e of m.edges) {
    while (e.fwd.n && (e.fwd.first() as { t1: number }).t1 <= t1) {
      const x = e.fwd.shift();
      e.inT -= x.c;
      m.tokens--;
      deliver(m, e, x);
      m.pool.push(x);
    }
    while (e.back.n && (e.back.first() as { t1: number }).t1 <= t1) {
      const x = e.back.shift();
      e.backT -= x.c;
      m.tokens--;
      deliverBack(m, e, x);
      m.pool.push(x);
    }
  }
};

/** Weeks of work waiting: amber from one week, red from two, with a gap so it never blinks. */
export const level = (lvl: number, w: number): number => {
  if (lvl === 0) return w >= AMBER ? 1 : 0;
  if (lvl === 1) return w >= RED ? 2 : w < AMBER * 0.85 ? 0 : 1;
  return w < RED * 0.9 ? 1 : 2;
};

const sample = (n: FactoryNode): void => {
  const h = n.hist,
    r_ = n.rate,
    tot = r_.out[0] + r_.out[1];
  h.out.push(r_.done);
  h.good.push(tot > 0.05 ? (r_.out[1] / tot) * 100 : null);
  h.wait.push(n.Ws);
  h.L.push(n.Lavg);
  for (const k of ['out', 'good', 'wait', 'L'] as const) if (h[k].length > 32) h[k].shift();
};

interface Decay {
  readonly fdec: number;
  readonly a: number;
  readonly sampleNow: boolean;
}

const decayRates = (n: FactoryNode, fdec: number): void => {
  const r_ = n.rate;
  r_.done *= fdec;
  r_.arr *= fdec;
  r_.back *= fdec;
  r_.rwIn *= fdec;
  r_.unread *= fdec;
  r_.out[0] *= fdec;
  r_.out[1] *= fdec;
};

/** Busy, blocked, starved and on complaint work: each 1 or 0 this step. */
const stateOf = (n: FactoryNode): { busy: number; blocked: number; starved: number; onBug: number } => {
  const sv = n.server as NonNullable<FactoryNode['server']>,
    mine = sv.n === n;
  const working = mine && sv.busy && !sv.blocked,
    bit = (x: unknown) => (x ? 1 : 0);
  return {
    busy: bit(working),
    blocked: bit(mine && sv.blocked),
    starved: bit(!mine && !n.L),
    onBug: bit(working && sv.J.fl & FAIL),
  };
};

const average = (m: Factory, n: FactoryNode, k: Decay): void => {
  const u = n.u,
    g = 1 - k.fdec;
  decayRates(n, k.fdec);
  const x = stateOf(n);
  u.busy += (x.busy - u.busy) * g;
  u.fail += (x.onBug - u.fail) * g;
  u.blocked += (x.blocked - u.blocked) * g;
  u.starved += (x.starved - u.starved) * g;
  n.Lavg += (n.L - n.Lavg) * g;
  n.Ws += (n.L / speedOf(n, m.dc[n.idx]) - n.Ws) * k.a;
  n.press = Math.min(1, n.Ws / RED);
  n.lvl = level(n.lvl, n.Ws);
  if (k.sampleNow) sample(n);
};

const decayBelts = (m: Factory, fdec: number): void => {
  for (const e of m.edges) {
    e.rate *= fdec;
    e.backRate *= fdec;
    // a rework lane shows while work is sent back on it, with a gap so it never blinks
    if (!e.retOn && e.backRate > RET_SHOW) e.retOn = true;
    else if (e.retOn && e.backRate < RET_HIDE) e.retOn = false;
  }
};

const decayCustomer = (m: Factory, dt: number, fdec: number): void => {
  const odec = Math.exp(-dt / TAU_OUT);
  m.wipAvg += (m.wip - m.wipAvg) * (1 - odec);
  m.mainRate *= odec;
  m.ownRate *= odec;
  m.outRate *= odec;
  m.rel[0] *= odec;
  m.rel[1] *= odec;
  m.compl *= odec;
  m.arrRate *= fdec;
  m.fu *= fdec;
  m.req *= fdec;
};

/** Advances the model one step of `dt` weeks. */
export const step = (m: Factory, dt = DTW): void => {
  const t0 = m.t,
    t1 = t0 + dt,
    fdec = Math.exp(-dt / TAU),
    a = 1 - Math.exp(-dt / 0.25);
  for (const n of m.centers) m.dc[n.idx] = dials(n, m.s);
  requests(m, t0, t1);
  ownTickets(m, t0, t1);
  deliveries(m, t1);
  for (const sv of m.servers) runServer(m, sv, { t0, t1 });
  m.t = t1;
  const sampleNow = m.t >= m.sampleAt;
  if (sampleNow) m.sampleAt = m.t + 0.5;
  for (const n of m.centers) average(m, n, { fdec, a, sampleNow });
  decayBelts(m, fdec);
  decayCustomer(m, dt, fdec);
};
