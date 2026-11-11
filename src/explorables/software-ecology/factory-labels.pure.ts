/*
 * Where each belt's hover label sits (design-ADR 0024 §19): on its longest straight runs first, clear of the cards and
 * of the labels placed before it. The width is estimated from the text, as the reference build does, so the places
 * are the same in every locale's length.
 */
import { boxOf, type FactoryLayout, type Pt } from './factory-layout.pure.ts';
import type { NodeDef } from './factory.types';

type Box = readonly [number, number, number, number];

/** A label's anchor point and its text anchor. */
export interface LabelPlace {
  readonly x: number;
  readonly y: number;
  readonly anchor: 'middle' | 'start' | 'end';
}

interface Cand extends LabelPlace {
  readonly b: Box;
}

const runsOf = (c: readonly Pt[]): [Pt, Pt][] =>
  c
    .slice(1)
    .map((p, i): [Pt, Pt] => [c[i] as Pt, p])
    .sort(([a0, a1], [b0, b1]) => Math.hypot(b1[0] - b0[0], b1[1] - b0[1]) - Math.hypot(a1[0] - a0[0], a1[1] - a0[1]));

const FRACTIONS = [0.5, 0.3, 0.7];

const across = ([x0, y0]: Pt, [x1]: Pt, w: number): Cand[] =>
  FRACTIONS.flatMap((f) => {
    const x = x0 + (x1 - x0) * f;
    return [
      { x, y: y0 + 30, anchor: 'middle', b: [x - w / 2, y0 + 18, x + w / 2, y0 + 42] },
      { x, y: y0 - 34, anchor: 'middle', b: [x - w / 2, y0 - 46, x + w / 2, y0 - 22] },
    ];
  });

const along = ([x0, y0]: Pt, [, y1]: Pt, w: number): Cand[] =>
  FRACTIONS.flatMap((f) => {
    const y = y0 + (y1 - y0) * f;
    return [
      { x: x0 + 18, y, anchor: 'start', b: [x0 + 14, y - 12, x0 + 18 + w, y + 12] },
      { x: x0 - 26, y, anchor: 'end', b: [x0 - 26 - w, y - 12, x0 - 22, y + 12] },
    ];
  });

const candidates = (c: readonly Pt[], w: number): Cand[] =>
  runsOf(c).flatMap(([a, b]) => (a[1] === b[1] ? across(a, b, w) : along(a, b, w)));

const hits = (boxes: readonly Box[], b: Box): boolean =>
  boxes.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);

/**
 * Places every belt's label; `textOf` gives the text the width is estimated from (the reference build measures the
 * label with "· 12 a week · ↩" and its sent-back words).
 */
export const placeLabels = (
  layout: FactoryLayout,
  cards: readonly NodeDef[],
  textOf: (key: string) => string,
): Record<string, LabelPlace> => {
  const boxes: Box[] = cards.map((d) => {
    const [x, y, w, h] = boxOf(d);
    return [x - 4, y - 4, x + w + 4, y + h + 4];
  });
  const out: Record<string, LabelPlace> = {};
  for (const key of layout.order) {
    const belt = layout.belts[key];
    if (!belt) continue;
    const cands = candidates(belt.corners, textOf(key).length * 6.4 + 70);
    const c = (cands.find((q) => !hits(boxes, q.b)) ?? cands[0]) as Cand;
    boxes.push(c.b);
    out[key] = { x: c.x, y: c.y, anchor: c.anchor };
  }
  return out;
};
