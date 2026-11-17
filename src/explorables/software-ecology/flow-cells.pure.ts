// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { DEFECTS } from './defect.pure.ts';
import type { Defect } from './software-ecology.types';

export const NF_ = 72;
export const KIND_CELLS = NF_ / 2;

export interface Cell {
  readonly kind?: Defect;
  readonly q: number;
  readonly f: number;
  readonly b: number;
  readonly mn: number;
}
export const fi = (c: Cell): number => (c.kind === 'code' ? KIND_CELLS : 0) + ((c.q * 2 + c.f) * 3 + c.b) * 3 + c.mn;

export type Indexed = Cell & { readonly kind: Defect; readonly i: number };
export const cells = (mns: readonly number[]): Indexed[] =>
  DEFECTS.flatMap((kind) =>
    [0, 1].flatMap((q) =>
      [0, 1].flatMap((f) =>
        [0, 1, 2].flatMap((b) => mns.map((mn) => ({ kind, q, f, b, mn, i: fi({ kind, q, f, b, mn }) }))),
      ),
    ),
  );
