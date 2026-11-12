/*
 * The factory's canvas (design-ADR 0024 §14): documents on belts, racks, pile-ups and the document in work, in one
 * canvas over the SVG belts. The floor fits the stage (contain), centred; the canvas runs at up to twice the device
 * pixels. Colours are read from the tokens and re-read when the theme changes. It reads the model only through the
 * handle's Floor and hears it through `listen`; it never writes into the model. Ported from the reference build's
 * `measure` and `draw`.
 */
import { label, makeSheet, readColors, type Colors, type Ctx } from './doc-sprites.ts';
import type { BeltLayout, FactoryLayout, Pt } from './factory-layout.pure.ts';
import type { Floor, FloorBelt, FloorListener, FloorStation } from './factory-model.pure.ts';
import { drawRiders, ScreenTimes, type Frame, type Lane, type Rider, type Riders } from './paint-belts.ts';
import { drawPile, pileFor, type Pile, type PileStyle } from './paint-pile.ts';
import { drawRack, drawWork } from './paint-rack.ts';
import { settle, Stations, type Landing } from './paint-station.ts';

/** Where the floor sits in the stage: scale and offset, in CSS pixels. */
export interface Fit {
  readonly k: number;
  readonly ox: number;
  readonly oy: number;
}

/** The floor's fit into a stage of `w` × `h` CSS pixels. */
export const fitOf = (layout: Pick<FactoryLayout, 'width' | 'height' | 'top'>, w: number, h: number): Fit => {
  const k = Math.min(w / layout.width, h / layout.height);
  return { k, ox: (w - layout.width * k) / 2, oy: (h - layout.height * k) / 2 - layout.top * k };
};

/** What a frame draws beyond the model: the time, the speed, the words. */
export interface DrawIn {
  readonly now: number;
  readonly reduced: boolean;
  readonly warming: string | null;
  readonly secsPerWeek: number;
  readonly blocked: string;
  readonly pile: PileStyle;
}

const SHEET_PX = 15 * 2;
const EASE_SECS = 0.07;

const lanesFor = (e: FloorBelt, b: BeltLayout): readonly [Lane, Lane] => {
  const top = e.from.kind === 'role' && (b.corners[0] as Pt)[1] < e.from.def.y - 1;
  return [
    { path: b.vis, inner: b.inner, hideIn: top ? b.inner : -1, back: false },
    { path: b.retVis, inner: 0, hideIn: -1, back: true },
  ];
};

class Single implements Riders {
  l: Landing | null = null;
  get n() {
    return this.l ? 1 : 0;
  }
  at(): Rider {
    return this.l as Landing;
  }
}

export class FactoryPainter {
  readonly clock = { now: 0, reduced: false };
  readonly stations: Stations;
  private readonly screen = new ScreenTimes();
  private C: Colors | null = null;
  private sheet: HTMLCanvasElement | null = null;
  private px = 0;
  private fit: Fit = { k: 1, ox: 0, oy: 0 };
  private dpr = 1;
  private last = 0;
  private readonly piles = new Map<FloorStation, Pile | null>();
  private readonly one = new Single();
  private readonly lanes = new Map<string, readonly [Lane, Lane]>();

  constructor(
    private readonly floor: Floor,
    private readonly layout: FactoryLayout,
  ) {
    this.stations = new Stations(layout, this.clock, this.screen);
    for (const e of floor.belts) this.lanes.set(e.key, lanesFor(e, layout.belts[e.key] as BeltLayout));
  }

  /** What the painter hears from the floor once the line is warm: documents land from then on. */
  get listener(): FloorListener {
    return this.stations.hear;
  }

  /** Re-reads the colours, for a theme change. */
  recolor() {
    this.C = null;
  }

  /** Sizes the canvas to its stage; returns the fit for the card floor, or null when the stage has no size. */
  measure(canvas: HTMLCanvasElement, rect: { width: number; height: number }, dpr: number): Fit | null {
    if (!rect.width || !rect.height) return null;
    this.dpr = Math.min(2, dpr || 1);
    this.fit = fitOf(this.layout, rect.width, rect.height);
    const w = Math.round(rect.width * this.dpr),
      h = Math.round(rect.height * this.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return this.fit;
  }

  private ensure(c: Ctx) {
    if (!this.C) {
      this.C = readColors(c.canvas.ownerDocument);
      this.sheet = null;
    }
    const px = Math.max(8, Math.round(SHEET_PX * this.fit.k * this.dpr));
    if (!this.sheet || this.px !== px) {
      this.px = px;
      this.sheet = makeSheet(c.canvas.ownerDocument, this.C, px);
    }
  }

  private lanesOf(key: string): readonly [Lane, Lane] {
    const l = this.lanes.get(key);
    if (!l) throw new Error(`no belt ${key}`);
    return l;
  }

  private pileOf(n: FloorStation): Pile | null {
    if (!this.piles.has(n)) this.piles.set(n, pileFor(n, this.floor.seed));
    return this.piles.get(n) ?? null;
  }

  private endOf(P: Pile): readonly Pt[] {
    return (this.layout.belts[P.e.key] as BeltLayout).path.pts;
  }

  private belts(f: Frame) {
    for (const e of this.floor.belts) {
      const [fwd, back] = this.lanesOf(e.key);
      drawRiders(f, fwd, e.fwd);
      if (e.back.n) drawRiders(f, back, e.back);
    }
    for (const l of this.stations.lands) {
      this.one.l = l;
      drawRiders(f, this.lanesOf(l.e.key)[l.back ? 1 : 0], this.one);
    }
  }

  private centers(f: Frame, x: { dt: number; at: DrawIn }) {
    const ease = x.at.warming ? 1 : 1 - Math.exp(-x.dt / EASE_SECS);
    for (const n of this.floor.stations) {
      const v = this.stations.of(n),
        P = this.pileOf(n);
      settle(n, v, ease);
      if (P) drawPile(f, n, { P, pts: this.endOf(P), dt: x.dt, style: x.at.pile });
      drawRack(f, n, v);
      drawWork(f, n, { v, at: { ai: n.ai, secsPerWeek: x.at.secsPerWeek, blocked: x.at.blocked } });
    }
  }

  private warmLabel(c: Ctx, text: string) {
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    label(c, this.C as Colors, { text, x: 16, y: 22, color: (this.C as Colors).dull, size: 12, align: 'left' });
  }

  /** One frame. */
  draw(c: Ctx, at: DrawIn) {
    this.ensure(c);
    const dt = this.last ? Math.min(0.1, (at.now - this.last) / 1000) : 0.016;
    this.last = at.now;
    Object.assign(this.clock, { now: at.now, reduced: at.reduced });
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    const { k, ox, oy } = this.fit,
      d = this.dpr;
    c.setTransform(d * k, 0, 0, d * k, d * ox, d * oy);
    const f: Frame = {
      c,
      C: this.C as Colors,
      sheet: this.sheet as HTMLCanvasElement,
      px: this.px,
      now: at.now,
      tr: this.floor.t,
      reduced: at.reduced,
      screen: this.screen,
      sprites: 0,
    };
    this.stations.landAll();
    this.belts(f);
    this.centers(f, { dt, at });
    if (at.warming) this.warmLabel(c, at.warming);
  }
}
