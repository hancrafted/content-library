/*
 * Where a tour caption sits (design-ADR 0024 §10), as the reference build's `placeTour` puts it: below its card when
 * there is room, else above, kept 8 px inside the stage, its tail pointing at the card's middle; without a card in
 * view, in the stage's top-left corner. Boxes are viewport coordinates; the result is relative to the stage. No DOM.
 */
import type { Rect } from './dash-placement.pure.ts';

export interface TourPlace {
  readonly side: 'below' | 'above' | 'none';
  readonly left: number;
  readonly top: number;
  readonly width: number;
  /** The tail's offset from the caption's left edge. */
  readonly tail: number;
}

const MAX = 380;
const GAP = 12;
const EDGE = 8;
const TAIL = 16;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const placeTour = (x: { card: Rect | null; wrap: Rect; box: { height: number } }): TourPlace => {
  const { card: r, wrap: wr } = x,
    bw = Math.min(MAX, wr.width - 24),
    bh = x.box.height;
  if (!r) return { side: 'none', left: 12, top: 12, width: bw, tail: 0 };
  const cx = r.left - wr.left + r.width / 2,
    below = r.top + r.height - wr.top + GAP,
    above = r.top - wr.top - bh - GAP;
  const side = below + bh <= wr.height - EDGE || above < EDGE ? 'below' : 'above';
  const left = Math.max(EDGE, Math.min(wr.width - bw - EDGE, cx - bw / 2));
  const top = side === 'below' ? Math.min(below, wr.height - bh - EDGE) : above;
  return { side, left, top, width: bw, tail: clamp(cx - left, TAIL, bw - TAIL) };
};
