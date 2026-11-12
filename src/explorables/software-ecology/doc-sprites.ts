/*
 * The documents on the canvas (design-ADR 0024 §15), drawn as the reference build draws them: a sheet with a folded
 * corner, a red minus when bad, a red warning when a complaint or rework, and an AI-made one in the `ai` tint with a
 * star. Colours come from the design tokens at runtime, so both themes follow the site. The eight kinds are drawn once
 * into a sprite sheet at the current scale; a frame only copies them.
 */

import { bulb, giftBox, star } from './doc-gift.ts';

import type { Colors, Ctx, DocKind } from './doc-types.ts';

export type { Colors, Ctx, DocKind } from './doc-types.ts';

const mix = (a: string, pct: number, b: string) => `color-mix(in oklab, ${a} ${pct}%, ${b})`;

/** Reads every colour through one hidden probe element. */
export const readColors = (doc: Document): Colors => {
  const probe = doc.createElement('span');
  probe.hidden = true;
  doc.body.append(probe);
  const tok = (css: string) => {
    probe.style.color = '';
    probe.style.color = css;
    return getComputedStyle(probe).color;
  };
  const dark = doc.documentElement.classList.contains('dark');
  const paper = dark ? mix('var(--foreground)', 92, 'var(--background)') : 'var(--card)';
  const out: Colors = {
    dark,
    paper: tok(paper),
    fg: tok('var(--foreground)'),
    edge: tok(dark ? mix('var(--background)', 60, 'var(--foreground)') : mix('var(--foreground)', 45, 'var(--card)')),
    ai: tok('var(--ai)'),
    aiFill: tok(mix('var(--ai)', 20, paper)),
    good: tok('var(--success)'),
    warn: tok('var(--warning)'),
    ...{ bulb: tok('var(--bulb)'), bulbEdge: tok('var(--bulb-edge)') },
    dull: tok('var(--muted-foreground)'),
    border: tok('var(--border)'),
    destr: tok('var(--destructive)'),
    badTint: tok(mix('var(--destructive)', 18, 'transparent')),
    font: getComputedStyle(doc.body).fontFamily,
  };
  probe.remove();
  return out;
};

const DW = 9,
  DH = 11.5,
  DF = 3;

/** A drawn document's height in sprite units, at `s: 1.05` on a sprite cell: what `makeSheet` draws. */
export const DOC_H = DH * 1.05;

/** The bulb's glyph spans y -2.3 to 3.9 around its point, so this centres it on the sheet's (0, 0). */
export const BULB_AT = { x: 0, y: -0.8 };

const sheetPath = (c: Ctx) => {
  c.beginPath();
  c.moveTo(-DW / 2, -DH / 2);
  c.lineTo(DW / 2 - DF, -DH / 2);
  c.lineTo(DW / 2, -DH / 2 + DF);
  c.lineTo(DW / 2, DH / 2);
  c.lineTo(-DW / 2, DH / 2);
  c.closePath();
};

const bang = (c: Ctx, sz: number, color: string) => {
  c.fillStyle = color;
  c.fillRect(-0.45 * sz, 1.3 - 1.7 * sz, 0.9 * sz, 2.3 * sz);
  c.fillRect(-0.45 * sz, 1.3 + sz, 0.9 * sz, 0.85 * sz);
};

const fillIn = (c: Ctx, C: Colors, x: { ai: boolean; fill: number }) => {
  c.save();
  sheetPath(c);
  c.clip();
  c.fillStyle = x.ai ? C.ai : C.fg;
  c.globalAlpha = 0.28;
  c.fillRect(-DW / 2, DH / 2 - DH * x.fill, DW, DH * x.fill);
  c.restore();
};

const outline = (c: Ctx, C: Colors, ai: boolean) => {
  c.lineWidth = ai ? 1.5 : 0.9;
  c.strokeStyle = ai ? C.ai : C.edge;
  sheetPath(c);
  c.stroke();
  c.beginPath();
  c.moveTo(DW / 2 - DF, -DH / 2);
  c.lineTo(DW / 2 - DF, -DH / 2 + DF);
  c.lineTo(DW / 2, -DH / 2 + DF);
  c.closePath();
  c.lineWidth = 0.7;
  c.strokeStyle = C.edge;
  c.stroke();
};

const marks = (c: Ctx, C: Colors, d: DocKind) => {
  if (d.warn) {
    c.fillStyle = C.destr;
    c.beginPath();
    c.moveTo(0, -2.6);
    c.lineTo(3.9, 3.6);
    c.lineTo(-3.9, 3.6);
    c.closePath();
    c.fill();
    bang(c, 0.95, C.paper);
  } else if (d.q === 0) {
    c.fillStyle = C.destr;
    c.beginPath();
    c.roundRect(-3, -0.95, 6, 1.9, 0.9);
    c.fill();
  }
};

/** A sheet with a folded corner in the page's ink: filling when in work, else with its marks. */
const sheetDoc = (p: { c: Ctx; C: Colors }, d: DocKind, fill?: number) => {
  const { c, C } = p;
  sheetPath(c);
  c.fillStyle = d.ai ? C.aiFill : C.paper;
  c.fill();
  if (fill !== undefined) fillIn(c, C, { ai: d.ai, fill });
  outline(c, C, d.ai);
  if (d.own) bulb(c, C, BULB_AT);
  if (fill === undefined) marks(c, C, d);
  if (d.ai) star(c, { x: -DW / 2 + 0.3, y: -DH / 2 + 0.3, r: 3.4 }, C.ai);
};

/** Draws one document at (x, y), scale `s`; `fill` (0 to 1) draws a document in work, filling from the bottom. */
export const drawDoc = (
  p: { c: Ctx; C: Colors },
  at: { x: number; y: number; s: number; fill?: number },
  d: DocKind,
) => {
  const { c, C } = p;
  c.save();
  c.translate(at.x, at.y);
  c.scale(at.s, at.s);
  c.lineJoin = 'round';
  if (d.gift) giftBox(c, C, d);
  else sheetDoc(p, d, at.fill);
  c.restore();
};

/** A sprite cell, in layout units. */
export const SPR = 15;
/** The sprite of a kind: quality, AI, warning; then own work (a lightbulb) and a release (a gift box). */
export const spriteIdx = (k: {
  readonly q: number;
  readonly ai: number | boolean;
  readonly warn: number | boolean;
  readonly own?: boolean;
  readonly gift?: boolean;
}): number => (k.gift ? GIFT : 0) + (k.own ? 8 : 0) + (k.warn ? 4 : 0) + (k.ai ? 2 : 0) + k.q;

/** A sprite index at or above this is a gift box. */
export const GIFT = 16;
/** The kinds of document sprite: quality, AI, warning, own work, and plain or gift. */
export const KINDS = 32;

/** The thirty-two kinds drawn once at `px` pixels a cell. */
export const makeSheet = (doc: Document, C: Colors, px: number): HTMLCanvasElement => {
  const sheet = doc.createElement('canvas');
  sheet.width = px * KINDS;
  sheet.height = px;
  const c = sheet.getContext('2d') as Ctx;
  for (let i = 0; i < KINDS; i++) {
    c.setTransform(px / SPR, 0, 0, px / SPR, i * px, 0);
    const kind = { q: i & 1, ai: !!((i >> 1) & 1), warn: !!((i >> 2) & 1), own: !!((i >> 3) & 1), gift: i >= GIFT };
    drawDoc({ c, C }, { x: SPR / 2, y: SPR / 2, s: 1.05 }, kind);
  }
  return sheet;
};

/** A "×n" badge for documents riding together. */
export const badge = (c: Ctx, C: Colors, at: { x: number; y: number; n: number }) => {
  const t = `×${at.n}`;
  c.font = `700 8.5px ${C.font}`;
  const w = c.measureText(t).width + 6;
  c.fillStyle = C.fg;
  c.beginPath();
  c.roundRect(at.x, at.y - 6, w, 11, 5.5);
  c.fill();
  c.fillStyle = C.paper;
  c.textAlign = 'left';
  c.fillText(t, at.x + 3, at.y + 3);
};

/** A canvas text in the page font. */
export interface LabelAt {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly size: number;
  readonly align: CanvasTextAlign;
}
export const label = (c: Ctx, C: Colors, at: LabelAt) => {
  c.font = `600 ${at.size}px ${C.font}`;
  c.fillStyle = at.color;
  c.textAlign = at.align;
  c.fillText(at.text, at.x, at.y);
};
