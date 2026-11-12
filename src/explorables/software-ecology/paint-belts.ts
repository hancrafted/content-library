/*
 * Documents riding a belt (design-ADR 0024 §14): each token is a count of identical documents. A handoff plays over a
 * fixed 0.6 s of screen time at any speed, from when the painter first draws the token; neighbours of the same kind
 * closer than GAP merge into one sprite with "×n". A document leaving a station shrinks from its in-work size over the
 * stretch inside the card. Ported from the reference build's `drawBelt`.
 */
import { badge, SPR, spriteIdx, type Colors, type Ctx } from './doc-sprites.ts';
import type { FloorDoc, FloorList } from './factory-model.pure.ts';
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
  /** When each document was first drawn: the painter's own screen time. */
  readonly screen: ScreenTimes;
  sprites: number;
}

/** A document the model delivered while its handoff still plays on screen: its kind is known, its screen time its own. */
export interface Landed {
  readonly c: number;
  readonly k: number;
  readonly vr: number;
}

/** Something riding a belt: a document on the floor, or one that has landed but still plays its handoff. */
export type Rider = FloorDoc | Landed;
export type Riders = FloorList<Rider>;

const isLanded = (x: Rider): x is Landed => 'k' in x;

/**
 * When each document on the floor was first drawn, in real ms. The model pools its documents, so one sent again (at
 * another `t0`) starts afresh; a merged one keeps its time.
 */
export class ScreenTimes {
  private readonly seen = new WeakMap<FloorDoc, { t0: number; vr: number }>();

  /** The document's first-drawn time, set to `now` on first sight. */
  of(x: FloorDoc, now: number): number {
    const e = this.seen.get(x);
    if (e && e.t0 === x.t0) return e.vr;
    if (e) Object.assign(e, { t0: x.t0, vr: now });
    else this.seen.set(x, { t0: x.t0, vr: now });
    return now;
  }

  /** The first-drawn time if it was drawn, else 0. */
  peek(x: FloorDoc): number {
    const e = this.seen.get(x);
    return e && e.t0 === x.t0 ? e.vr : 0;
  }
}

/** How far along its handoff a rider is, 0 to 1. */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const steady = (x: Rider, tr: number): number => (isLanded(x) ? 1 : clamp01((tr - x.t0) / (x.t1 - x.t0)));
const progress = (x: Rider, f: Frame): number => {
  if (f.reduced) return steady(x, f.tr);
  const vr = isLanded(x) ? x.vr : f.screen.of(x, f.now);
  return Math.min(1, (f.now - vr) / (HANDOFF_SECS * 1000));
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

/** A document's sprite: a sent-back one is drawn bad with its warning; a complaint carries its mark. */
export const docKind = (x: FloorDoc, back: boolean): number =>
  back ? spriteIdx(0, x.ai, true) : spriteIdx(x.good ? 1 : 0, x.ai, x.complaint);

const kindOf = (x: Rider, back: boolean): number => (isLanded(x) ? x.k : docKind(x, back));

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
