/*
 * Where a dashboard popover sits beside its card (design-ADR 0024 §17), as the reference build's `placePopover` puts
 * it: a speech bubble to the card's left, else its right when the left has no room, else above, else below, kept 8 px
 * inside the stage, its tail pointing at the card's middle. The popover is fixed to the window, so given the window it
 * also stays 8 px inside that. Boxes are viewport coordinates; no DOM.
 */

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type DashSide = 'left' | 'right' | 'above' | 'below';

export interface DashPlace {
  readonly side: DashSide;
  /** Viewport coordinates of the popover's top-left corner. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** The tail's offset along the popover's edge facing the card. */
  readonly tail: number;
}

/** The widest a dashboard grows. */
export const DASH_MAX = 540;
const GAP = 16;
const EDGE = 8;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** The popover's width inside `stage`: at most 540, 24 narrower than the stage. */
export const dashWidth = (stage: Rect): number => Math.min(DASH_MAX, stage.width - 24);

const inView = (y: number, h: number, view: Rect | undefined) =>
  view ? clamp(y, view.top + EDGE, view.top + view.height - h - EDGE) : y;

export const placeDash = (x: { card: Rect; stage: Rect; height: number; view?: Rect }): DashPlace => {
  const { card: cr, stage: wr, height: ph } = x;
  const pw = dashWidth(wr),
    cx = cr.left - wr.left,
    cy = cr.top - wr.top;
  const midY = clamp(cy + cr.height / 2 - ph / 2, EDGE, wr.height - ph - EDGE),
    midX = clamp(cx + cr.width / 2 - pw / 2, EDGE, wr.width - pw - EDGE);
  let side: DashSide, px: number, py: number;
  if (cx - pw - GAP < EDGE && cx + cr.width + GAP + pw <= wr.width - EDGE)
    [side, px, py] = ['right', cx + cr.width + GAP, midY];
  else if (cx - pw - GAP >= EDGE) [side, px, py] = ['left', cx - pw - GAP, midY];
  else if (cy - ph - GAP >= EDGE) [side, px, py] = ['above', midX, cy - ph - GAP];
  else [side, px, py] = ['below', midX, cy + cr.height + GAP];
  const across = side === 'left' || side === 'right';
  const tail = across ? clamp(cy + cr.height / 2 - py, GAP, ph - GAP) : clamp(cx + cr.width / 2 - px, GAP, pw - GAP);
  return { side, x: wr.left + px, y: inView(wr.top + py, ph, x.view), width: pw, tail };
};
