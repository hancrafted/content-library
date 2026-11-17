// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type DashSide = 'left' | 'right' | 'above' | 'below';

export interface DashPlace {
  readonly side: DashSide;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly tail: number;
}

/** The widest a dashboard grows. */
export const DASH_MAX = 540;
const GAP = 16;
const EDGE = 8;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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
