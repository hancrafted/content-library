// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { drawDoc, label, SPR } from './doc-sprites.ts';
import type { FloorStation, FloorWork } from './factory-model.pure.ts';
import type { Frame } from './paint-belts.ts';
import { RACK_W, rackX, SLOT, slotY, type Sprite, type StationVis } from './paint-station.ts';
import { RACK } from './stage-readouts.pure.ts';

const STEADY_SECS = 0.25;
const STEADY_FILL = 0.6;
const STAMP_FROM = 0.78;

const blit = (f: Frame, d: Pick<Sprite, 'k' | 'x' | 'y' | 's'>, alpha: number) => {
  f.c.globalAlpha = alpha;
  const sz = SPR * d.s;
  f.c.drawImage(f.sheet, d.k * f.px, 0, f.px, f.px, d.x - sz / 2, d.y - sz / 2, sz, sz);
};

const frame = (f: Frame, n: FloorStation, over: boolean) => {
  const c = f.c,
    d = n.node.def,
    x = rackX(d),
    hw = RACK_W / 2,
    top = slotY(d, RACK - 1) - SLOT / 2,
    bot = slotY(d, 0) + SLOT / 2;
  c.lineWidth = 0.8;
  c.strokeStyle = f.C.border;
  if (over) {
    c.fillStyle = f.C.badTint;
    c.fillRect(x - hw, top, RACK_W, SLOT);
  }
  c.beginPath();
  c.moveTo(x - hw, top);
  c.lineTo(x - hw, bot);
  c.lineTo(x + hw, bot);
  c.lineTo(x + hw, top);
  for (let i = 1; i < RACK; i++) {
    const yy = slotY(d, i) + SLOT / 2;
    c.moveTo(x - hw, yy);
    c.lineTo(x + hw, yy);
  }
  c.stroke();
  if (!over) return;
  c.strokeStyle = f.C.destr;
  c.lineWidth = 1.4;
  c.strokeRect(x - hw, top, RACK_W, SLOT);
};

export const drawRack = (f: Frame, n: FloorStation, v: StationVis) => {
  frame(f, n, n.waiting > RACK);
  for (const g of v.ghosts) blit(f, g, Math.max(0, g.life));
  for (const d of v.q) blit(f, d, d.a);
  f.c.globalAlpha = 1;
};

export const progressOf = (sv: Pick<FloorWork, 'busy' | 'blocked' | 'start' | 'end'>, t: number): number => {
  if (!sv.busy) return sv.blocked ? 1 : 0;
  const p = (t - sv.start) / Math.max(1e-9, sv.end - sv.start);
  return p < 0 ? 0 : p > 1 ? 1 : p;
};

const stamp = (f: Frame, w: Sprite, x: { good: boolean; p: number }) => {
  const c = f.c,
    k = w.s / 1.4;
  c.save();
  c.globalAlpha = Math.min(1, (x.p - STAMP_FROM) / 0.08);
  c.translate(w.x - 8 * k, w.y + 5 * k);
  c.scale(k, k);
  c.rotate(-0.25);
  c.strokeStyle = x.good ? f.C.good : f.C.destr;
  c.lineWidth = 1.7;
  c.beginPath();
  c.arc(0, 0, 6.5, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  if (x.good) {
    c.moveTo(-3.2, 0);
    c.lineTo(-0.8, 2.6);
    c.lineTo(3.4, -2.6);
  } else {
    c.moveTo(-2.8, -2.8);
    c.lineTo(2.8, 2.8);
    c.moveTo(2.8, -2.8);
    c.lineTo(-2.8, 2.8);
  }
  c.stroke();
  c.restore();
};

export interface WorkAt {
  readonly ai: boolean;
  readonly secsPerWeek: number;
  readonly blocked: string;
}

const kindOfJob = (sv: FloorWork, ai: boolean) => ({
  q: sv.doc.complaint || sv.doc.fromCustomer || sv.doc.good ? 1 : 0,
  ai,
  warn: sv.bounce || sv.doc.complaint || sv.doc.redo,
  own: sv.doc.own,
});

const steadyFill = (sv: FloorWork, secsPerWeek: number): boolean =>
  secsPerWeek > 0 && (sv.end - sv.start) * secsPerWeek < STEADY_SECS;

export const drawWork = (f: Frame, n: FloorStation, x: { v: StationVis; at: WorkAt }) => {
  const sv = n.work,
    w = x.v.work;
  if (!sv || !w) return;
  const d = kindOfJob(sv, x.at.ai),
    pos = { x: w.x, y: w.y, s: 1.05 * w.s },
    p = { c: f.c, C: f.C };
  f.c.globalAlpha = 1;
  if (sv.blocked) {
    drawDoc(p, pos, d);
    label(f.c, f.C, { text: x.at.blocked, x: w.x, y: w.y + 26, color: f.C.destr, size: 11, align: 'center' });
    return;
  }
  if (steadyFill(sv, x.at.secsPerWeek)) {
    drawDoc(p, { ...pos, fill: STEADY_FILL }, d);
    return;
  }
  const pr = progressOf(sv, f.tr);
  drawDoc(p, { ...pos, fill: pr }, d);
  if (pr > STAMP_FROM) stamp(f, w, { good: sv.stampGood, p: pr });
};
