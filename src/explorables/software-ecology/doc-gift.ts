/*
 * The marks beyond a plain document (design-ADR 0024 §15), drawn on the canvas in sprite units: the AI star, the
 * lightbulb of own work, and the gift box of a release with the red bug of a bad one. Colours come from the painter's
 * token palette; `doc-sprites.ts` draws them into the sprite sheet.
 */
import type { Colors, Ctx, DocKind } from './doc-types.ts';

export const star = (c: Ctx, at: { x: number; y: number; r: number }, color: string) => {
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2,
      rr = i % 2 ? at.r * 0.32 : at.r;
    c.lineTo(at.x + Math.cos(a) * rr, at.y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
};

/** The lightbulb of own work: an amber bulb on a small base, at (x, y). */
export const bulb = (c: Ctx, C: Colors, at: { x: number; y: number }) => {
  c.save();
  c.translate(at.x, at.y);
  c.fillStyle = C.warn;
  c.strokeStyle = C.fg;
  c.lineWidth = 0.55;
  c.beginPath();
  c.arc(0, 0, 2.3, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = C.fg;
  c.fillRect(-1, 2.1, 2, 0.9);
  c.fillRect(-0.7, 3.2, 1.4, 0.7);
  c.restore();
};

/** A small red bug: body, head, legs and feelers, centred at (x, y). */
const bug = (c: Ctx, C: Colors, at: { x: number; y: number }) => {
  c.save();
  c.translate(at.x, at.y);
  c.strokeStyle = C.destr;
  c.fillStyle = C.destr;
  c.lineWidth = 0.7;
  c.lineCap = 'round';
  c.beginPath();
  for (const dy of [-1, 0.6, 2.2]) {
    c.moveTo(-1.6, dy);
    c.lineTo(-3.4, dy - 0.8);
    c.moveTo(1.6, dy);
    c.lineTo(3.4, dy - 0.8);
  }
  c.moveTo(-0.6, -2.8);
  c.lineTo(-1.6, -4.2);
  c.moveTo(0.6, -2.8);
  c.lineTo(1.6, -4.2);
  c.stroke();
  c.beginPath();
  c.ellipse(0, 0.8, 1.9, 2.7, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(0, -2, 1.1, 0, Math.PI * 2);
  c.fill();
  c.restore();
};

/** A gift box's lid, body and ribbon with a bow: the AI tint and border as on a document. */
const giftBody = (c: Ctx, C: Colors, d: DocKind) => {
  c.fillStyle = d.ai ? C.aiFill : C.paper;
  c.strokeStyle = d.ai ? C.ai : C.edge;
  c.lineWidth = d.ai ? 1.5 : 0.9;
  c.lineJoin = 'round';
  c.beginPath();
  c.rect(-4.3, -1.2, 8.6, 6);
  c.fill();
  c.stroke();
  c.beginPath();
  c.rect(-5, -3.6, 10, 2.4);
  c.fill();
  c.stroke();
  c.fillStyle = d.q ? C.good : C.dull;
  c.fillRect(-0.9, -3.6, 1.8, 8.4);
  c.beginPath();
  c.ellipse(-2, -4.5, 2, 1.1, -0.35, 0, Math.PI * 2);
  c.ellipse(2, -4.5, 2, 1.1, 0.35, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = C.edge;
  c.lineWidth = 0.5;
  c.stroke();
};

/** A gift box: a red bug when bad, a lightbulb when it carries own work, the AI star when AI made it. */
export const giftBox = (c: Ctx, C: Colors, d: DocKind) => {
  giftBody(c, C, d);
  if (!d.q) bug(c, C, { x: 2.6, y: 2.6 });
  if (d.own) bulb(c, C, { x: -2.6, y: 2.2 });
  if (d.ai) star(c, { x: -4.3, y: -3.4, r: 3.4 }, C.ai);
};
