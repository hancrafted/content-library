/*
 * The pile-up past the rack, at the end of the busiest belt in (design-ADR 0024 §14): drawn only, the model is
 * unchanged. Three styles, heap by default; every station draws its own seeded shapes, so no two piles look alike.
 * Sprites grow with the weeks of work waiting, twelve at most. Ported from the reference build's `pileOf` and `drawPile`.
 */
import { SPR } from './doc-sprites.ts';
import type { FloorBelt, FloorStation } from './factory-model.pure.ts';
import type { Pt } from './factory-paths.pure.ts';
import { mix, mulberry } from './factory-random.pure.ts';
import type { Frame } from './paint-belts.ts';
import { runKind } from './paint-station.ts';
import { RACK } from './stage-readouts.pure.ts';

export const PILE_MAX = 12;
/** How a pile-up looks; a later ticket may let the viewer pick one. */
export type PileStyle = 'heap' | 'stack' | 'drift';

interface Item {
  readonly u: number;
  readonly w: number;
  readonly z: number;
  readonly ph: number;
  t: number;
}
export interface Pile {
  readonly e: FloorBelt;
  readonly lean: number;
  readonly items: Item[];
  shown: number;
}

/** A station's pile, seeded by the model's seed and the station. */
export const pileFor = (n: FloorStation, seed: number): Pile | null => {
  const e = n.ins.slice().sort((a, b) => b.rate - a.rate || a.i - b.i)[0];
  if (!e) return null;
  const r = mulberry(mix(seed, 9000 + n.node.idx));
  const items = Array.from({ length: PILE_MAX }, () => ({ u: r(), w: r(), z: r(), ph: r() * Math.PI * 2, t: 0 }));
  return { e, lean: (r() - 0.5) * 0.5, items, shown: 0 };
};

/** The kinds of what waits past the rack, `k` at most. */
const kindsPast = (n: FloorStation, k: number): number[] => {
  const kinds: number[] = [];
  let skip = RACK;
  for (let ri = 0; ri < n.queue.n && kinds.length < k; ri++) {
    const r = n.queue.at(ri),
      kd = runKind(r);
    const take = Math.max(0, r.c - skip);
    skip = Math.max(0, skip - r.c);
    for (let j = 0; j < take && kinds.length < k; j++) kinds.push(kd);
  }
  return kinds;
};

interface Place {
  ax: number;
  ay: number;
  rot: number;
  s: number;
}
interface Axis {
  readonly end: Pt;
  readonly dx: number;
  readonly dy: number;
  readonly t: number;
  readonly k: number;
  readonly lean: number;
}

const stack = (a: Axis, i: number, it: Item): Place => {
  const h = i * 4.2;
  return {
    ax: a.end[0] - a.dx * 16 + Math.sin(a.lean) * h,
    ay: a.end[1] - a.dy * 16 - h - (1 - it.t) * 14,
    rot: a.lean * 0.6 + Math.sin(a.t * 1.7 + it.ph) * 0.04 * (i / a.k) + (it.u - 0.5) * 0.15,
    s: 1,
  };
};

const drift = (a: Axis, _i: number, it: Item): Place => {
  const back = 10 + it.u * (10 + a.k * 2.2),
    side = (it.w - 0.5) * (14 + a.k * 2.5);
  return {
    ax: a.end[0] - a.dx * back - a.dy * side + Math.sin(a.t * 2.3 + it.ph) * 0.9,
    ay: a.end[1] - a.dy * back + a.dx * side + Math.cos(a.t * 2.9 + it.ph) * 0.9 - (1 - it.t) * 10,
    rot: (it.z - 0.5) * 1.6 + Math.sin(a.t * 1.3 + it.ph) * 0.08,
    s: 1,
  };
};

const heap = (a: Axis, i: number, it: Item): Place => {
  const row = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2),
    col = i - (row * (row + 1)) / 2,
    lay = 4 - row;
  const along = 12 + (col - row / 2) * 9 * (1 + 0.1 * lay) + (it.u - 0.5) * 4;
  return {
    ax: a.end[0] - a.dx * along - a.dy * (it.w - 0.5) * 6,
    ay: a.end[1] - a.dy * along - row * 6 - (1 - it.t) * (16 + row * 4),
    rot: (it.z - 0.5) * 0.9 + (1 - it.t) * (it.u - 0.5) * 3,
    s: 1 - row * 0.03,
  };
};

const STYLES: Record<PileStyle, (a: Axis, i: number, it: Item) => Place> = { heap, stack, drift };

/** The belt's end and its direction into the card, from the drawn path. */
export const beltEnd = (pts: readonly Pt[]): { end: Pt; dx: number; dy: number } => {
  const end = pts[pts.length - 1] as Pt,
    prev = pts[Math.max(0, pts.length - 6)] as Pt;
  const dx = end[0] - prev[0],
    dy = end[1] - prev[1],
    l = Math.hypot(dx, dy) || 1;
  return { end, dx: dx / l, dy: dy / l };
};

/** Draws a station's pile-up; `dt` in seconds since the last frame. */
export const drawPile = (
  f: Frame,
  n: FloorStation,
  x: { P: Pile; pts: readonly Pt[]; dt: number; style: PileStyle },
) => {
  const P = x.P,
    want = n.waiting > RACK ? Math.min(PILE_MAX, Math.max(1, Math.ceil(n.weeksWaiting * 3))) : 0;
  P.shown += (want - P.shown) * Math.min(1, x.dt * 4);
  const k = Math.round(P.shown);
  for (let i = k; i < PILE_MAX; i++) (P.items[i] as Item).t = 0;
  if (!k) return;
  const a: Axis = { ...beltEnd(x.pts), t: f.now / 1000, k, lean: P.lean },
    kinds = kindsPast(n, k),
    place = STYLES[x.style];
  for (let i = 0; i < k; i++) {
    const it = P.items[i] as Item;
    it.t = Math.min(1, it.t + x.dt * 3);
    const q = place(a, i, it),
      sz = SPR * q.s,
      kd = kinds[i] ?? 0;
    f.c.save();
    f.c.translate(q.ax, q.ay);
    f.c.rotate(q.rot);
    f.c.globalAlpha = Math.min(1, 0.3 + it.t);
    f.c.drawImage(f.sheet, kd * f.px, 0, f.px, f.px, -sz / 2, -sz / 2, sz, sz);
    f.c.restore();
    f.sprites++;
  }
  f.c.globalAlpha = 1;
};
