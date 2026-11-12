/*
 * What a station shows on the canvas, kept in step with the model (design-ADR 0024 §14): the rack of six slots on
 * the left, filling from the bottom, and the document in work. Documents slide in from the belt, down the rack, into
 * work and out onto the next belt; nothing appears or vanishes abruptly. The floor's events (the handle's `listen`)
 * report arrivals, starts and ends; each frame eases every document toward its place. Ported from the reference build's `visHook`, `landAll` and
 * `settle`.
 */
import { spriteIdx } from './doc-sprites.ts';
import { BOT, HALF, TOP, workAt, type FactoryLayout } from './factory-layout.pure.ts';
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
import { docKind, HANDOFF_SECS, WORK_S, type ScreenTimes } from './paint-belts.ts';
import { RACK } from './stage-readouts.pure.ts';

export const RACK_W = 44,
  RACK_PAD = 5;
export const SLOT = (TOP + BOT - 2 * RACK_PAD) / RACK;
/** A document in the rack, relative to one on a belt. */
export const RACK_S = 1.15;

type At = Pick<NodeDef, 'x' | 'y'>;
export const rackX = (d: At): number => d.x - HALF + RACK_PAD + RACK_W / 2;
export const slotY = (d: At, i: number): number => d.y + BOT - RACK_PAD - SLOT / 2 - i * SLOT;

/** A drawn document: its kind, place, scale and opacity. */
export interface Sprite {
  k: number;
  x: number;
  y: number;
  s: number;
  a: number;
}
export interface Ghost extends Sprite {
  life: number;
}

/** A document the model delivered while its handoff still plays on screen. */
export interface Landing {
  readonly e: FloorBelt;
  readonly back: boolean;
  readonly n: FloorStation;
  readonly c: number;
  readonly k: number;
  vr: number;
}

/** A station's drawn state. */
export interface StationVis {
  q: Sprite[];
  work: Sprite | null;
  ghosts: Ghost[];
  readonly land: Landing[];
}

const doc = (k: number, at: Pt, s: number): Sprite => ({ k, x: at[0], y: at[1], s, a: 1 });
const faint = (k: number, at: Pt, s: number): Sprite => ({ ...doc(k, at, s), a: 0 });
/** A waiting document's sprite: rework and complaint-born work carry the warning mark. */
export const runKind = (r: DocMarks): number => spriteIdx(r.good ? 1 : 0, r.ai, r.redo || r.complaint);

/** The drawn state of every station, the landings in flight, and the listener the floor calls. */
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

  /** The floor's events: a delivery lands, an own ticket appears, a job starts or ends. */
  readonly hear: FloorListener = (what, n, at) => {
    if (!n) return;
    if (what === 'arrive' || what === 'front') this.arrive(n, { belt: at?.belt, x: at?.x, back: what === 'front' });
    else this.change(what, n);
  };

  private change(what: FloorEvent, n: FloorStation) {
    const d = n.node.def;
    if (what === 'own') this.of(n).q.push(faint(spriteIdx(1, 0, 0), [rackX(d), slotY(d, RACK - 1) - SLOT], RACK_S));
    else if (what === 'start') {
      const v = this.of(n);
      v.work = v.q.shift() ?? doc(0, workAt(d), WORK_S);
    } else if (what === 'done') this.of(n).work = null;
  }

  private arrive(n: FloorStation, x: { belt?: FloorBelt; x?: FloorDoc | number; back: boolean }) {
    if (!x.belt || x.x === undefined || typeof x.x === 'number') return;
    const t = x.x,
      k = docKind(t, x.back),
      v = this.of(n);
    if (this.clock.reduced) {
      v.q.push(doc(k, this.end(x.belt, x.back), 1));
      return;
    }
    const l: Landing = { e: x.belt, back: x.back, n, c: t.c, k, vr: this.screen.peek(t) || this.clock.now };
    this.lands.push(l);
    v.land.push(l);
  }

  /** A landing that reached the end of its belt joins the rack where the belt ends. */
  landAll() {
    for (let i = this.lands.length - 1; i >= 0; i--) {
      const l = this.lands[i] as Landing;
      if (this.clock.now - l.vr < HANDOFF_SECS * 1000) continue;
      this.lands.splice(i, 1);
      const v = this.of(l.n);
      v.land.splice(v.land.indexOf(l), 1);
      const d = doc(l.k, this.end(l.e, l.back), l.back ? 0.8 : 1);
      if (l.back) v.q.unshift(d);
      else v.q.push(d);
    }
  }
}

/** The rack in step with the model: as many as wait (six at most, less the ones still landing), each of its kind. */
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

/** Each frame: keep the rack in step with the model and ease every document toward its place. */
export const settle = (n: FloorStation, v: StationVis, ease: number) => {
  const at = n.node.def;
  syncRack(n, v);
  v.q.forEach((d, j) => {
    easeTo(d, { x: rackX(at), y: slotY(at, j), s: RACK_S }, ease);
    d.a += (1 - d.a) * ease;
  });
  easeWork(n, v, ease);
  for (const g of v.ghosts) {
    easeTo(g, { x: rackX(at), y: slotY(at, RACK - 1), s: g.s }, ease);
    g.life -= ease * 0.9;
  }
  if (v.ghosts.length) v.ghosts = v.ghosts.filter((g) => g.life > 0.05);
};
