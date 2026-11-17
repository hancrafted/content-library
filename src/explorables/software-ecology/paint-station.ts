// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { spriteIdx } from './doc-sprites.ts';
import { BOT, HALF, HEAD, TOP, workAt, type FactoryLayout } from './factory-layout.pure.ts';
import type {
  DocMarks,
  FloorBelt,
  FloorDoc,
  FloorEvent,
  FloorListener,
  FloorStation,
  NodeDef,
} from './factory-model.pure.ts';
import type { Pt } from './factory-paths.pure.ts';
import { docKind, handoffSecs, WORK_S, type ScreenTimes } from './paint-belts.ts';
import { RACK } from './stage-readouts.pure.ts';

export const RACK_W = 44,
  RACK_PAD = 5;
export const SLOT = (TOP + BOT - HEAD - 2 * RACK_PAD) / RACK;
export const RACK_S = 1.15;

type At = Pick<NodeDef, 'x' | 'y'>;
export const rackX = (d: At): number => d.x - HALF + RACK_PAD + RACK_W / 2;
export const slotY = (d: At, i: number): number => d.y + BOT - RACK_PAD - SLOT / 2 - i * SLOT;

export const GLYPH_PAD = 7,
  GLYPH_SIZE = 16;
export const glyphAt = (d: At): Pt => [d.x - HALF + GLYPH_PAD + GLYPH_SIZE / 2, d.y - TOP + HEAD / 2];
export const OWN_DROP_SECONDS = 0.4;
const POP_S = 0.5;

export interface Sprite {
  k: number;
  x: number;
  y: number;
  s: number;
  a: number;
  drop?: { readonly from: Pt; readonly t0: number };
}
export interface Ghost extends Sprite {
  life: number;
}

export interface Landing {
  readonly e: FloorBelt;
  readonly back: boolean;
  readonly n: FloorStation | null;
  readonly c: number;
  readonly k: number;
  vr: number;
}

export interface StationVis {
  q: Sprite[];
  work: Sprite | null;
  ghosts: Ghost[];
  readonly land: Landing[];
}

const doc = (k: number, at: Pt, s: number): Sprite => ({ k, x: at[0], y: at[1], s, a: 1 });
const faint = (k: number, at: Pt, s: number): Sprite => ({ ...doc(k, at, s), a: 0 });
export const runKind = (r: DocMarks): number =>
  spriteIdx({ q: r.good ? 1 : 0, ai: r.ai, warn: r.redo || r.complaint, own: r.own });

export class Stations {
  readonly vis = new Map<FloorStation, StationVis>();
  readonly lands: Landing[] = [];

  constructor(
    private readonly layout: FactoryLayout,
    private readonly clock: { now: number; reduced: boolean },
    private readonly screen: ScreenTimes,
  ) {}

  of(n: FloorStation): StationVis {
    let v = this.vis.get(n);
    if (!v) this.vis.set(n, (v = { q: [], work: null, ghosts: [], land: [] }));
    return v;
  }

  private end(e: FloorBelt, back: boolean): Pt {
    const b = this.layout.belts[e.key];
    const pts = b ? (back ? b.retVis : b.path).pts : [];
    return pts[pts.length - 1] ?? [e.to.def.x, e.to.def.y];
  }

  readonly hear: FloorListener = (what, n, at) => {
    if (what === 'arrive' || what === 'front') this.arrive(n, { belt: at?.belt, x: at?.x, back: what === 'front' });
    else if (n) this.change(what, n);
  };

  private change(what: FloorEvent, n: FloorStation) {
    const d = n.node.def;
    if (what === 'own') this.pop(n);
    else if (what === 'start') {
      const v = this.of(n);
      v.work = v.q.shift() ?? doc(0, workAt(d), WORK_S);
    } else if (what === 'done') this.of(n).work = null;
  }

  private pop(n: FloorStation) {
    const d = n.node.def,
      v = this.of(n),
      k = spriteIdx({ q: 1, ai: 0, warn: 0, own: true });
    if (this.clock.reduced) {
      v.q.push(doc(k, [rackX(d), slotY(d, Math.min(v.q.length, RACK - 1))], RACK_S));
      return;
    }
    const from = glyphAt(d);
    v.q.push({ ...doc(k, from, RACK_S * POP_S), drop: { from, t0: this.clock.now } });
  }

  private arrive(n: FloorStation | null, x: { belt?: FloorBelt; x?: FloorDoc | number; back: boolean }) {
    if (!x.belt || x.x === undefined || typeof x.x === 'number') return;
    const t = x.x,
      k = docKind(t, { back: x.back, gift: x.belt.release });
    if (this.clock.reduced) return this.place(n, { k, at: this.end(x.belt, x.back) });
    const l: Landing = { e: x.belt, back: x.back, n, c: t.c, k, vr: this.screen.peek(t) || this.clock.now };
    this.lands.push(l);
    if (n) this.of(n).land.push(l);
  }

  private place(n: FloorStation | null, x: { k: number; at: Pt }) {
    if (n) this.of(n).q.push(doc(x.k, x.at, 1));
  }

  landAll() {
    for (let i = this.lands.length - 1; i >= 0; i--) {
      const l = this.lands[i] as Landing;
      if (this.clock.now - l.vr < handoffSecs(l.e.release) * 1000) continue;
      this.lands.splice(i, 1);
      if (!l.n) continue;
      const v = this.of(l.n);
      v.land.splice(v.land.indexOf(l), 1);
      const d = doc(l.k, this.end(l.e, l.back), l.back ? 0.8 : 1);
      if (l.back) v.q.unshift(d);
      else v.q.push(d);
    }
  }
}

const syncRack = (n: FloorStation, v: StationVis) => {
  const landing = v.land.reduce((a, l) => a + l.c, 0),
    want = Math.max(0, Math.min(n.waiting - landing, RACK)),
    d = n.node.def,
    runs = n.queue;
  while (v.q.length > want) v.ghosts.push({ ...(v.q.pop() as Sprite), life: 1 });
  let i = 0;
  for (let ri = 0; ri < runs.n && i < want; ri++) {
    const r = runs.at(ri),
      k = runKind(r);
    for (let j = 0; j < r.c && i < want; j++, i++) {
      if (i >= v.q.length) v.q.push(faint(k, [rackX(d), slotY(d, RACK - 1)], RACK_S));
      (v.q[i] as Sprite).k = k;
    }
  }
};

const easeTo = (d: Sprite, to: { x: number; y: number; s: number }, ease: number) => {
  d.x += (to.x - d.x) * ease;
  d.y += (to.y - d.y) * ease;
  d.s += (to.s - d.s) * ease;
};

const easeWork = (n: FloorStation, v: StationVis, ease: number) => {
  if (!n.work) {
    v.work = null;
    return;
  }
  const [wx, wy] = workAt(n.node.def);
  if (!v.work) v.work = doc(0, [wx, wy], WORK_S);
  easeTo(v.work, { x: wx, y: wy, s: WORK_S }, ease);
};

const drop = (d: Sprite, to: { x: number; y: number; s: number }, now: number) => {
  const dr = d.drop as NonNullable<Sprite['drop']>,
    u = Math.min(1, (now - dr.t0) / (OWN_DROP_SECONDS * 1000)),
    fall = u * u;
  d.x = dr.from[0] + (to.x - dr.from[0]) * u;
  d.y = dr.from[1] + (to.y - dr.from[1]) * fall;
  d.s = RACK_S * (POP_S + (1 - POP_S) * Math.min(1, u * 2));
  d.a = 1;
  if (u >= 1) d.drop = undefined;
};

export const settle = (n: FloorStation, v: StationVis, x: { ease: number; now: number }) => {
  const at = n.node.def,
    ease = x.ease;
  syncRack(n, v);
  v.q.forEach((d, j) => {
    const to = { x: rackX(at), y: slotY(at, j), s: RACK_S };
    if (d.drop) return drop(d, to, x.now);
    easeTo(d, to, ease);
    d.a += (1 - d.a) * ease;
  });
  easeWork(n, v, ease);
  for (const g of v.ghosts) {
    easeTo(g, { x: rackX(at), y: slotY(at, RACK - 1), s: g.s }, ease);
    g.life -= ease * 0.9;
  }
  if (v.ghosts.length) v.ghosts = v.ghosts.filter((g) => g.life > 0.05);
};
