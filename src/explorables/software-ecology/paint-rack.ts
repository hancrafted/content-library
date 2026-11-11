/*
 * The rack and the document in work, on the canvas (design-ADR 0024 §14): six slots at the card's full height,
 * filling from the bottom; past six the top slot turns red. The document in work fills from the bottom and is stamped
 * good or bad as it ends; it never restarts within a job. Ported from the reference build's `drawRack` and `drawWork`.
 */
import { drawDoc, label, SPR } from './doc-sprites.ts';
import { Q } from './factory-dials.pure.ts';
import { COMPL, FROM_SRC, REDO } from './factory-flow.pure.ts';
import type { FactoryNode, Server } from './factory.types';
import type { Frame } from './paint-belts.ts';
import { RACK_W, rackX, SLOT, slotY, type Sprite, type StationVis } from './paint-station.ts';
import { RACK } from './stage-readouts.pure.ts';

/** Below this many real seconds a job, the station shows a steady document in work: no blinking. */
const STEADY_SECS = 0.25;
const STEADY_FILL = 0.6;
const STAMP_FROM = 0.78;

const blit = (f: Frame, d: Pick<Sprite, 'k' | 'x' | 'y' | 's'>, alpha: number) => {
  f.c.globalAlpha = alpha;
  const sz = SPR * d.s;
  f.c.drawImage(f.sheet, d.k * f.px, 0, f.px, f.px, d.x - sz / 2, d.y - sz / 2, sz, sz);
};

const frame = (f: Frame, n: FactoryNode, over: boolean) => {
  const c = f.c,
    x = rackX(n),
    hw = RACK_W / 2,
    top = slotY(n, RACK - 1) - SLOT / 2,
    bot = slotY(n, 0) + SLOT / 2;
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
    const yy = slotY(n, i) + SLOT / 2;
    c.moveTo(x - hw, yy);
    c.lineTo(x + hw, yy);
  }
  c.stroke();
  if (!over) return;
  c.strokeStyle = f.C.destr;
  c.lineWidth = 1.4;
  c.strokeRect(x - hw, top, RACK_W, SLOT);
};

/** The rack: its slots, the ones leaving and the ones waiting. */
export const drawRack = (f: Frame, n: FactoryNode, v: StationVis) => {
  frame(f, n, n.L > RACK);
  for (const g of v.ghosts) blit(f, g, Math.max(0, g.life));
  for (const d of v.q) blit(f, d, d.a);
  f.c.globalAlpha = 1;
};

/** How far a job is done, 0 to 1, at model time `t`. */
export const progressOf = (sv: Pick<Server, 'busy' | 'blocked' | 'start' | 'end'>, t: number): number => {
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

/** What the painter needs beyond the frame to draw a document in work. */
export interface WorkAt {
  readonly ai: boolean;
  /** Real seconds a model week takes at the current speed; 0 when paused. */
  readonly secsPerWeek: number;
  readonly blocked: string;
}

const kindOfJob = (sv: Server, ai: boolean) => ({
  q: sv.J.fl & (COMPL | FROM_SRC) ? Q.GOOD : sv.J.q,
  ai,
  warn: sv.bounce || (sv.J.fl & (COMPL | REDO)) !== 0,
});

const working = (n: FactoryNode): Server | null => {
  const sv = n.server;
  return sv && sv.n === n && (sv.busy || sv.blocked) ? sv : null;
};

const steadyFill = (sv: Server, secsPerWeek: number): boolean =>
  secsPerWeek > 0 && (sv.end - sv.start) * secsPerWeek < STEADY_SECS;

/** The document in work: filling, stamped as it ends, or held with "blocked". */
export const drawWork = (f: Frame, n: FactoryNode, x: { v: StationVis; at: WorkAt }) => {
  const sv = working(n),
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
  if (pr > STAMP_FROM) stamp(f, w, { good: sv.preQ === Q.GOOD && !sv.bounce, p: pr });
};
