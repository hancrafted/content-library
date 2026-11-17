// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { Defect } from './defect.types';

export const FROM_SRC = 1,
  REDO = 2,
  COMPL = 4,
  FAIL = 8,
  SENT = 16,
  MAIN = 32,
  OWN = 64,
  SPEC = 128,
  CODE = 256;
export const kindBit = (k: Defect): number => (k === 'code' ? CODE : SPEC);
export const kindOf = (fl: number, fallback: Defect): Defect => (fl & CODE ? 'code' : fl & SPEC ? 'spec' : fallback);

export const Q = { BAD: 0, GOOD: 1 } as const;

export interface DocMarks {
  readonly ai: number;
  readonly good: boolean;
  readonly complaint: boolean;
  readonly redo: boolean;
  readonly fromCustomer: boolean;
  readonly own: boolean;
}

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

export class Token extends Marked {
  c = 0;
  b = 0;
  t0 = 0;
  t1 = 0;
}

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

export class Job extends Marked {
  e = 0;
  b = 0;
}
