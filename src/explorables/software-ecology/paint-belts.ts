// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { badge, DOC_H, GIFT, KINDS, SPR, spriteIdx, type Colors, type Ctx } from './doc-sprites.ts';
import { BELT_W, RETURN_W } from './factory-layout.pure.ts';
import type { FloorDoc, FloorList } from './factory-model.pure.ts';
import { at, type Path } from './factory-paths.pure.ts';

const HANDOFF_SECONDS = 0.6;
const RELEASE_SECONDS = 1.2;
export const handoffSecs = (release: boolean): number => (release ? RELEASE_SECONDS : HANDOFF_SECONDS);
export const GIFT_SCALE = 1.5;
export const GAP = 16;
export const BELT_FILL = 0.9;
export const MAX_SPRITES = 600;
export const WORK_S = 2.8;

export interface Frame {
  readonly c: Ctx;
  readonly C: Colors;
  readonly sheet: CanvasImageSource;
  readonly px: number;
  readonly now: number;
  readonly tr: number;
  readonly reduced: boolean;
  readonly screen: ScreenTimes;
  sprites: number;
}

export interface Landed {
  readonly c: number;
  readonly k: number;
  readonly vr: number;
}

export type Rider = FloorDoc | Landed;
export type Riders = FloorList<Rider>;

const isLanded = (x: Rider): x is Landed => 'k' in x;

export class ScreenTimes {
  private readonly seen = new WeakMap<FloorDoc, { t0: number; vr: number }>();

  of(x: FloorDoc, now: number): number {
    const e = this.seen.get(x);
    if (e && e.t0 === x.t0) return e.vr;
    if (e) Object.assign(e, { t0: x.t0, vr: now });
    else this.seen.set(x, { t0: x.t0, vr: now });
    return now;
  }

  peek(x: FloorDoc): number {
    const e = this.seen.get(x);
    return e && e.t0 === x.t0 ? e.vr : 0;
  }
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const steady = (x: Rider, tr: number): number => (isLanded(x) ? 1 : clamp01((tr - x.t0) / (x.t1 - x.t0)));
const progress = (x: Rider, f: Frame, secs: number): number => {
  if (f.reduced) return steady(x, f.tr);
  const vr = isLanded(x) ? x.vr : f.screen.of(x, f.now);
  return Math.min(1, (f.now - vr) / (secs * 1000));
};

export interface Lane {
  readonly path: Path;
  readonly inner: number;
  readonly hideIn: number;
  readonly back: boolean;
  readonly secs: number;
  readonly gift: boolean;
}

const MERGE = new Float64Array(KINDS * 2);

export const beltScale = (back: boolean): number => (BELT_FILL * (back ? RETURN_W : BELT_W)) / DOC_H;

const sprite = (f: Frame, lane: Lane, x: { k: number; s: number; cnt: number }) => {
  const p = at(lane.path, x.s);
  const base = beltScale(lane.back),
    size = x.s < lane.inner && !lane.back ? WORK_S - (WORK_S - base) * (x.s / lane.inner) : base,
    sz = SPR * size * (x.k >= GIFT ? GIFT_SCALE : 1);
  f.c.drawImage(f.sheet, x.k * f.px, 0, f.px, f.px, p[0] - sz / 2, p[1] - sz / 2, sz, sz);
  if (x.cnt > 1) badge(f.c, f.C, { x: p[0] + 5, y: p[1] - 12, n: x.cnt });
  f.sprites++;
};

const flush = (f: Frame, lane: Lane) => {
  for (let k = 0; k < KINDS; k++) {
    const cnt = MERGE[k * 2] as number;
    if (!cnt) continue;
    const s = (MERGE[k * 2 + 1] as number) / cnt;
    MERGE[k * 2] = 0;
    MERGE[k * 2 + 1] = 0;
    if (f.sprites >= MAX_SPRITES || s < lane.hideIn) continue;
    sprite(f, lane, { k, s, cnt });
  }
};

export const docKind = (x: FloorDoc, how: { readonly back: boolean; readonly gift: boolean }): number =>
  how.back
    ? spriteIdx({ q: 0, ai: x.ai, warn: true, own: x.own })
    : spriteIdx({ q: x.good ? 1 : 0, ai: x.ai, warn: x.complaint && !how.gift, own: x.own, gift: how.gift });

const kindOf = (x: Rider, lane: Lane): number => (isLanded(x) ? x.k : docKind(x, { back: lane.back, gift: lane.gift }));

export const drawRiders = (f: Frame, lane: Lane, list: Riders) => {
  let bucket = -1;
  MERGE.fill(0);
  for (let i = list.n - 1; i >= 0; i--) {
    const x = list.at(i),
      s = lane.path.L * progress(x, f, lane.secs),
      b = Math.floor(s / GAP);
    if (b !== bucket) {
      if (bucket >= 0) flush(f, lane);
      bucket = b;
    }
    const k = kindOf(x, lane);
    MERGE[k * 2] = (MERGE[k * 2] as number) + x.c;
    MERGE[k * 2 + 1] = (MERGE[k * 2 + 1] as number) + s * x.c;
  }
  if (bucket >= 0) flush(f, lane);
};
