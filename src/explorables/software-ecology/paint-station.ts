/*
 * What a station shows on the canvas, kept in step with the model (design-ADR 0024 §14): the rack of six slots on
 * the left, filling from the bottom, and the document in work. Documents slide in from the belt, down the rack, into
 * work and out onto the next belt; nothing appears or vanishes abruptly. The model's hook reports arrivals, starts and
 * ends; each frame eases every document toward its place. Ported from the reference build's `visHook`, `landAll` and
 * `settle`.
 */
import { spriteIdx } from './doc-sprites.ts';
import { COMPL, REDO } from './factory-flow.pure.ts';
import { BOT, HALF, TOP, workAt, type FactoryLayout } from './factory-layout.pure.ts';
import type { Pt } from './factory-paths.pure.ts';
import type { Belt, FactoryNode, Run, Token } from './factory.types';
import { HANDOFF_SECS, WORK_S } from './paint-belts.ts';
import { RACK } from './stage-readouts.pure.ts';

export const RACK_W = 44,
  RACK_PAD = 5;
export const SLOT = (TOP + BOT - 2 * RACK_PAD) / RACK;
/** A document in the rack, relative to one on a belt. */
export const RACK_S = 1.15;

export const rackX = (n: FactoryNode): number => n.def.x - HALF + RACK_PAD + RACK_W / 2;
export const slotY = (n: FactoryNode, i: number): number => n.def.y + BOT - RACK_PAD - SLOT / 2 - i * SLOT;

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
  readonly e: Belt;
  readonly back: boolean;
  readonly n: FactoryNode;
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
export const runKind = (r: Pick<Run, 'q' | 'ai' | 'fl'>): number => spriteIdx(r.q, r.ai, (r.fl & (REDO | COMPL)) !== 0);
const tokenKind = (x: Token, back: boolean): number =>
  back ? spriteIdx(0, x.ai, true) : spriteIdx(x.q, x.ai, (x.fl & COMPL) !== 0);

/** The drawn state of every station, the landings in flight, and the hook the model calls. */
export class Stations {
  readonly vis = new Map<FactoryNode, StationVis>();
  readonly lands: Landing[] = [];

  constructor(
    private readonly layout: FactoryLayout,
    private readonly clock: { now: number; reduced: boolean },
  ) {}

  of(n: FactoryNode): StationVis {
    let v = this.vis.get(n);
    if (!v) this.vis.set(n, (v = { q: [], work: null, ghosts: [], land: [] }));
    return v;
  }

  private end(e: Belt, back: boolean): Pt {
    const b = this.layout.belts[e.key];
    const pts = b ? (back ? b.retVis : b.path).pts : [];
    return pts[pts.length - 1] ?? [e.to.def.x, e.to.def.y];
  }

  /** The model's hook: a delivery lands, an own ticket appears, a job starts or ends. */
  readonly hook = (what: string, n: FactoryNode, at?: { readonly e: Belt; readonly x: Token | number }) => {
    if (what === 'arrive' || what === 'front') this.arrive(n, { at, back: what === 'front' });
    else if (what === 'own')
      this.of(n).q.push(faint(spriteIdx(1, 0, 0), [rackX(n), slotY(n, RACK - 1) - SLOT], RACK_S));
    else if (what === 'start') {
      const v = this.of(n);
      v.work = v.q.shift() ?? doc(0, workAt(n.def), WORK_S);
    } else if (what === 'done') this.of(n).work = null;
  };

  private arrive(n: FactoryNode, x: { at?: { readonly e: Belt; readonly x: Token | number }; back: boolean }) {
    if (!x.at || typeof x.at.x === 'number') return;
    const t = x.at.x,
      k = tokenKind(t, x.back),
      v = this.of(n);
    if (this.clock.reduced) {
      v.q.push(doc(k, this.end(x.at.e, x.back), 1));
      return;
    }
    const l: Landing = { e: x.at.e, back: x.back, n, c: t.c, k, vr: t.vr || this.clock.now };
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
const syncRack = (n: FactoryNode, v: StationVis) => {
  const landing = v.land.reduce((a, l) => a + l.c, 0),
    want = Math.max(0, Math.min(n.L - landing, RACK));
  while (v.q.length > want) v.ghosts.push({ ...(v.q.pop() as Sprite), life: 1 });
  let i = 0;
  for (let ri = 0; ri < n.runs.n && i < want; ri++) {
    const r = n.runs.at(ri),
      k = runKind(r);
    for (let j = 0; j < r.c && i < want; j++, i++) {
      if (i >= v.q.length) v.q.push(faint(k, [rackX(n), slotY(n, RACK - 1)], RACK_S));
      (v.q[i] as Sprite).k = k;
    }
  }
};

const easeTo = (d: Sprite, to: { x: number; y: number; s: number }, ease: number) => {
  d.x += (to.x - d.x) * ease;
  d.y += (to.y - d.y) * ease;
  d.s += (to.s - d.s) * ease;
};

const easeWork = (n: FactoryNode, v: StationVis, ease: number) => {
  const sv = n.server;
  if (!sv || sv.n !== n || !(sv.busy || sv.blocked)) {
    v.work = null;
    return;
  }
  const [wx, wy] = workAt(n.def);
  if (!v.work) v.work = doc(0, [wx, wy], WORK_S);
  easeTo(v.work, { x: wx, y: wy, s: WORK_S }, ease);
};

/** Each frame: keep the rack in step with the model and ease every document toward its place. */
export const settle = (n: FactoryNode, v: StationVis, ease: number) => {
  syncRack(n, v);
  v.q.forEach((d, j) => {
    easeTo(d, { x: rackX(n), y: slotY(n, j), s: RACK_S }, ease);
    d.a += (1 - d.a) * ease;
  });
  easeWork(n, v, ease);
  for (const g of v.ghosts) {
    easeTo(g, { x: rackX(n), y: slotY(n, RACK - 1), s: g.s }, ease);
    g.life -= ease * 0.9;
  }
  if (v.ghosts.length) v.ghosts = v.ghosts.filter((g) => g.life > 0.05);
};
