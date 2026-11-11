/*
 * Documents riding a belt (design-ADR 0024 §14): each token is a count of identical documents. A handoff plays over a
 * fixed 0.6 s of screen time at any speed, from when the painter first draws the token; neighbours of the same kind
 * closer than GAP merge into one sprite with "×n". A document leaving a station shrinks from its in-work size over the
 * stretch inside the card. Ported from the reference build's `drawBelt`.
 */
import { badge, SPR, spriteIdx, type Colors, type Ctx } from './doc-sprites.ts';
import { COMPL } from './factory-flow.pure.ts';
import { at, type Path } from './factory-paths.pure.ts';

/** A handoff animates this long on screen at any speed; the model keeps the quarter day. */
export const HANDOFF_SECS = 0.6;
/** A drawn document takes this much belt; closer ones of the same kind merge. */
export const GAP = 13;
/** Drawn documents at most; the rest are not drawn. */
export const MAX_SPRITES = 600;
/** The document in work, relative to one on a belt. */
export const WORK_S = 2.8;

/** One frame's drawing state, shared by every part of the painter. */
export interface Frame {
  readonly c: Ctx;
  readonly C: Colors;
  readonly sheet: CanvasImageSource;
  readonly px: number;
  /** Real time, in ms. */
  readonly now: number;
  /** Model time drawn, in weeks. */
  readonly tr: number;
  readonly reduced: boolean;
  sprites: number;
}

/** Something riding a belt: a model token (t0, t1) or a landing that has a kind already. */
export interface Rider {
  readonly c: number;
  readonly q?: number;
  readonly ai?: number;
  readonly fl?: number;
  readonly k?: number;
  readonly t0?: number;
  readonly t1?: number;
  vr: number;
}

export interface Riders {
  readonly n: number;
  at(i: number): Rider;
}

/** How far along its handoff a rider is, 0 to 1. */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const steady = (x: Rider, tr: number): number => {
  const t0 = x.t0 ?? 0;
  return clamp01((tr - t0) / ((x.t1 ?? 1) - t0));
};
const progress = (x: Rider, f: Frame): number => {
  if (f.reduced) return steady(x, f.tr);
  if (!x.vr) x.vr = f.now;
  return Math.min(1, (f.now - x.vr) / (HANDOFF_SECS * 1000));
};

/** How a belt is drawn: its path, the stretch inside the sender's card, the stretch hidden under a top port. */
export interface Lane {
  readonly path: Path;
  readonly inner: number;
  readonly hideIn: number;
  readonly back: boolean;
}

const MERGE = new Float64Array(16);

const sprite = (f: Frame, lane: Lane, x: { k: number; s: number; cnt: number }) => {
  const p = at(lane.path, x.s);
  const grow = x.s < lane.inner && !lane.back ? WORK_S - (WORK_S - 1) * (x.s / lane.inner) : 1,
    sz = (lane.back ? 0.8 : 1) * SPR * grow;
  f.c.drawImage(f.sheet, x.k * f.px, 0, f.px, f.px, p[0] - sz / 2, p[1] - sz / 2, sz, sz);
  if (x.cnt > 1) badge(f.c, f.C, { x: p[0] + 4, y: p[1] - 7, n: x.cnt });
  f.sprites++;
};

const flush = (f: Frame, lane: Lane) => {
  for (let k = 0; k < 8; k++) {
    const cnt = MERGE[k * 2] as number;
    if (!cnt) continue;
    const s = (MERGE[k * 2 + 1] as number) / cnt;
    MERGE[k * 2] = 0;
    MERGE[k * 2 + 1] = 0;
    if (f.sprites >= MAX_SPRITES || s < lane.hideIn) continue;
    sprite(f, lane, { k, s, cnt });
  }
};

const kindOf = (x: Rider, back: boolean): number =>
  x.k ?? spriteIdx(back ? 0 : (x.q ?? 1), x.ai ?? 0, back || ((x.fl ?? 0) & COMPL) !== 0);

/** Draws a belt's riders, newest first from the start of the belt, merging neighbours of one kind. */
export const drawRiders = (f: Frame, lane: Lane, list: Riders) => {
  let bucket = -1;
  MERGE.fill(0);
  for (let i = list.n - 1; i >= 0; i--) {
    const x = list.at(i),
      s = lane.path.L * progress(x, f),
      b = Math.floor(s / GAP);
    if (b !== bucket) {
      if (bucket >= 0) flush(f, lane);
      bucket = b;
    }
    const k = kindOf(x, lane.back);
    MERGE[k * 2] = (MERGE[k * 2] as number) + x.c;
    MERGE[k * 2 + 1] = (MERGE[k * 2 + 1] as number) + s * x.c;
  }
  if (bucket >= 0) flush(f, lane);
};
