/*
 * Backlogs and belts of the factory model (design-ADR 0024 §4): a backlog is a deque of runs of identical jobs, bucketed
 * per week; documents in transit are pooled tokens, each a count of identical documents, and every handoff takes the
 * same quarter day. A delivery to the Customer counts output, releases and follow-up requests.
 */
import type { Defect } from './defect.types';
import { MAX_TOKENS, TAU, TAU_OUT } from './factory-dials.pure.ts';
import { COMPL, FAIL, FROM_SRC, kindOf, MAIN, OWN, Q, REDO, Run, SENT, Token } from './factory-docs.pure.ts';
import type { Belt, Doc, Factory, FactoryNode, Job } from './factory.types';

export { FAIL, FROM_SRC, MAIN, OWN, REDO } from './factory-docs.pure.ts';
export const BUMP = 1 / TAU;

/** The releases the Customer keeps in view: the card's grid, and what satisfaction is measured over. */
export const SHELF = 20;

const same = (r: Run, x: Run): boolean => r.q === x.q && r.ai === x.ai && r.fl === x.fl && r.e === x.e && r.b === x.b;

/** Joins the last run when it holds the same jobs from the same week; else a new run at the back. */
export const pushBack = (n: FactoryNode, x: Run): void => {
  const R_ = n.runs;
  for (let i = R_.n - 1, k = 0; i >= 0 && k < 12; i--, k++) {
    const r = R_.at(i);
    if (r.wk !== x.wk) break;
    if (!same(r, x)) continue;
    if (i !== R_.n - 1) break;
    r.c += x.c;
    n.L += x.c;
    return;
  }
  R_.push(x);
  n.L += x.c;
};

/** Front of the line: rework and complaint-born work never wait. */
export const pushFront = (n: FactoryNode, x: Run): void => {
  const f = n.runs.first();
  if (f && same(f, x)) f.c += x.c;
  else n.runs.unshift(x);
  n.L += x.c;
};

export const popJob = (n: FactoryNode, J: Job): void => {
  const r = n.runs.first() as Run;
  J.q = r.q;
  J.ai = r.ai;
  J.fl = r.fl;
  J.e = r.e;
  J.b = r.b;
  if (--r.c === 0) n.runs.shift();
  n.L--;
};

const token = (m: Factory, x: Doc, T: number): Token => {
  const t = m.pool.pop() ?? new Token();
  t.c = x.c;
  t.q = x.q;
  t.ai = x.ai;
  t.fl = x.fl;
  t.b = x.b;
  t.t0 = x.t0;
  t.t1 = x.t0 + T;
  return t;
};

/** Past MAX_TOKENS a send rides as a count on a recent token of the same kind. */
const merged = (m: Factory, e: Belt, x: Doc): boolean => {
  for (let i = e.fwd.n - 1, k = 0; i >= 0 && k < 8; i--, k++) {
    const y = e.fwd.at(i);
    if (y.q === x.q && y.ai === x.ai && y.fl === x.fl && y.b === x.b) {
      y.c += x.c;
      m.overflow += x.c;
      return true;
    }
  }
  return false;
};

export const send = (m: Factory, e: Belt, x: Doc): void => {
  if (x.c <= 0) return;
  m.created += x.c;
  e.inT += x.c;
  e.rate += x.c / TAU;
  if (m.tokens >= MAX_TOKENS && merged(m, e, x)) return;
  e.fwd.push(token(m, x, e.T));
  m.tokens++;
};

/** The same document rides back to its sender. */
export const sendBack = (m: Factory, e: Belt, x: { J: Job; t0: number }): void => {
  const fl = (x.J.fl & (FAIL | MAIN | OWN)) | SENT;
  e.back.push(token(m, { c: 1, q: Q.BAD, ai: x.J.ai, fl, b: x.J.b + 1, t0: x.t0 }, e.T));
  e.backT++;
  m.tokens++;
  e.backRate += 1 / TAU;
};

const inTurn = (acc: Record<string, number>, list: Record<string, number>): string | null => {
  for (const [to, p] of Object.entries(list)) {
    acc[to] = (acc[to] || 0) + p;
    if (acc[to] < 1 - 1e-9) continue;
    acc[to] -= 1;
    return to;
  }
  return null;
};

const byChance = (r: number, list: Record<string, number>): string | null => {
  for (const [to, p] of Object.entries(list)) {
    if (r < p) return to;
    r -= p;
  }
  return null;
};

/** The Customer's follow-up request after a release: in Ideal in strict turns, otherwise by chance. */
const followUp = (m: Factory, list: Record<string, number>, q: number): Belt | null => {
  const c = m.cust,
    to = m.s.reality === 0 ? inTurn(c.acc[q], list) : byChance(c.rq(), list);
  return to === null ? null : (c.edgeTo.get(to) ?? null);
};

const countOutput = (m: Factory, x: Token): void => {
  if (x.q !== Q.GOOD || x.fl & FAIL) return;
  if (x.fl & OWN) {
    m.ownRate += 1 / TAU_OUT;
    m.ownN++;
  } else {
    m.outRate += 1 / TAU_OUT;
    m.outN++;
  }
};

/** The Customer's turns in Ideal (`acc`) a follow-up takes: a bad release's by its defect kind, or a good release's. */
const TURNS: Readonly<Record<Defect | 'good', number>> = { spec: 0, good: 1, code: 2 };

/** A bad release comes back by its defect kind: a change request (spec) or a bug (code). */
const complaintTo = (m: Factory, k: Defect): Belt | null =>
  m.s.mech.complaints ? followUp(m, m.cs.bad[k], TURNS[k]) : null;

const release = (m: Factory, x: Token): void => {
  const k = kindOf(x.fl, 'code');
  m.rel[x.q] += 1 / TAU_OUT;
  const fe = x.q === Q.GOOD ? followUp(m, m.cs.good, TURNS.good) : complaintTo(m, k);
  const compl = !!fe && x.q === Q.BAD;
  m.shelf.push({ q: x.q, ai: x.ai, compl });
  if (!fe) return;
  send(m, fe, { c: 1, q: Q.GOOD, ai: 0, fl: FROM_SRC | MAIN | (compl ? COMPL | FAIL : 0), b: 0, t0: x.t1 });
  m.wip++;
  m.fu += BUMP;
  if (!compl) return;
  m.compl += 1 / TAU_OUT;
  m.complK[k] += 1 / TAU_OUT;
};

const toCustomer = (m: Factory, e: Belt, x: Token): void => {
  m.consumed += x.c;
  m.arrRate += x.c * BUMP;
  if (!(x.fl & MAIN)) return;
  for (let i = 0; i < x.c; i++) {
    m.wip--;
    m.mainRate += 1 / TAU_OUT;
    countOutput(m, x);
    if (e.release) release(m, x);
  }
  if (m.shelf.length > SHELF) m.shelf.splice(0, m.shelf.length - SHELF);
};

export const deliver = (m: Factory, e: Belt, x: Token): void => {
  const B_ = e.to;
  if (B_.kind === 'customer') {
    toCustomer(m, e, x);
    m.hook?.('arrive', B_, { belt: e, x });
    return;
  }
  B_.rate.arr += x.c * BUMP;
  if (x.fl & COMPL) B_.sign.complaint = m.t;
  const run = new Run({ q: x.q, ai: x.ai, fl: x.fl, e: e.i, b: x.b, wk: Math.floor(x.t1), c: x.c });
  // Q114 A: complaint-born work handed on by another center (a bug ticket from Support) jumps the line
  if (x.fl & FAIL && e.from.kind === 'role') pushFront(B_, run);
  else pushBack(B_, run);
  m.hook?.('arrive', B_, { belt: e, x });
};

export const deliverBack = (m: Factory, e: Belt, x: Token): void => {
  const A = e.from;
  A.rate.arr += BUMP;
  A.rate.rwIn += BUMP;
  const fl = REDO | (x.fl & (FAIL | MAIN | OWN));
  pushFront(A, new Run({ q: Q.BAD, ai: x.ai, fl, e: e.i, b: x.b, wk: Math.floor(x.t1), c: x.c }));
  m.hook?.('front', A, { belt: e, x });
};
