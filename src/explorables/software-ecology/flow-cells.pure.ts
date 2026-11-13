/*
 * The flow-cell index (design-ADR 0024 §4): how a document's defect kind, quality, failure demand, times sent back and
 * carried content map to one slot of a belt's NF_ cells. The traffic equations in factory-traffic.pure.ts read and write
 * by this index.
 */
import { DEFECTS } from './defect.pure.ts';
import type { Defect } from './software-ecology.types';

export const NF_ = 72;
/** The cells of one defect kind: the first half of a belt's cells is spec, the second code. */
export const KIND_CELLS = NF_ / 2;

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

export type Indexed = Cell & { readonly kind: Defect; readonly i: number };
/** Every cell of every defect kind that carries one of the given contents, in the reference build's loop order. */
export const cells = (mns: readonly number[]): Indexed[] =>
  DEFECTS.flatMap((kind) =>
    [0, 1].flatMap((q) =>
      [0, 1].flatMap((f) =>
        [0, 1, 2].flatMap((b) => mns.map((mn) => ({ kind, q, f, b, mn, i: fi({ kind, q, f, b, mn }) }))),
      ),
    ),
  );
