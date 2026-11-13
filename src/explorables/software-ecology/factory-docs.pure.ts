/*
 * The factory model's documents (design-ADR 0024 §4): a token on a belt, a run of identical jobs in a backlog and the
 * job in work. Inside the model a document's history is a set of bit flags; outside it, through the Floor the handle
 * exposes, a document shows only named marks (good, AI-made, a complaint, sent back, straight from the Customer).
 */

import type { Defect } from './defect.types';

/** Job flags: a request straight from the Customer, to be redone, a complaint, failure demand, on its way back, the
 * document that carries a request on, a ticket of the company's own, and a bad document's defect kind (spec or code).
 * Model-internal: readers use the named marks. */
export const FROM_SRC = 1,
  REDO = 2,
  COMPL = 4,
  FAIL = 8,
  SENT = 16,
  MAIN = 32,
  OWN = 64,
  SPEC = 128,
  CODE = 256;
/** The flag of a defect kind: the job's one encoding of it, set and read only here. */
export const kindBit = (k: Defect): number => (k === 'code' ? CODE : SPEC);
/** A bad document's defect kind from its flags; `fallback` when it carries none. */
export const kindOf = (fl: number, fallback: Defect): Defect => (fl & CODE ? 'code' : fl & SPEC ? 'spec' : fallback);

/** Quality of a document. */
export const Q = { BAD: 0, GOOD: 1 } as const;

/** A document's marks, as everything outside the model reads them. */
export interface DocMarks {
  /** 1 when AI made it, else 0. */
  readonly ai: number;
  readonly good: boolean;
  /** Born of a complaint by the Customer. */
  readonly complaint: boolean;
  /** Sent back to be redone. */
  readonly redo: boolean;
  /** A request straight from the Customer or an own ticket: not yet worked on. */
  readonly fromCustomer: boolean;
  /** A ticket of the company's own, or the document that carries it on: it wears a lightbulb. */
  readonly own: boolean;
}

/** Quality, AI-made and flags, with the marks read from them. */
abstract class Marked implements DocMarks {
  q = 1;
  ai = 0;
  fl = 0;
  get good(): boolean {
    return this.q === Q.GOOD;
  }
  get complaint(): boolean {
    return (this.fl & COMPL) !== 0;
  }
  get redo(): boolean {
    return (this.fl & REDO) !== 0;
  }
  get fromCustomer(): boolean {
    return (this.fl & FROM_SRC) !== 0;
  }
  get own(): boolean {
    return (this.fl & OWN) !== 0;
  }
}

/** A token on a belt: a count of identical documents, sent at t0, arriving at t1. Pooled: the model reuses it. */
export class Token extends Marked {
  c = 0;
  b = 0;
  t0 = 0;
  t1 = 0;
}

/** A run of identical jobs waiting at a work center, from one week. */
export class Run extends Marked {
  constructor(x: { q: number; ai: number; fl: number; e: number; b: number; wk: number; c: number }) {
    super();
    this.q = x.q;
    this.ai = x.ai;
    this.fl = x.fl;
    this.e = x.e;
    this.b = x.b;
    this.wk = x.wk;
    this.c = x.c;
  }
  e = 0;
  b = 0;
  wk = 0;
  c = 0;
}

/** The job a server works on: quality, AI-made, flags, the belt it came on, times sent back. */
export class Job extends Marked {
  e = 0;
  b = 0;
}
