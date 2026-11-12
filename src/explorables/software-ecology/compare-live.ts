/*
 * The compare stream's live parts, drawn every frame outside React (design-ADR 0024 §14), as the reference build's
 * `frameCompare` draws them: each column's progress ring and the document in work, and the documents riding the belt
 * between neighbouring columns, one chip per token, at most 24. The chips are the canvas's documents as images, so
 * both themes follow the tokens. Reached only from the Explorable's client parent, through `useFactory`'s `onDraw`.
 */
import { drawDoc, readColors, type Colors } from './doc-sprites.ts';
import { dials, Q } from './factory-dials.pure.ts';
import { COMPL } from './factory-flow.pure.ts';
import { SPEED_1X, type FactoryRun } from './factory-run.pure.ts';
import type { Factory, FactoryNode, Server, Token } from './factory.types';
import { progressOf } from './paint-rack.ts';

const BELT_CHIPS = 24;
/** A job shorter than this many real seconds shows its ring at 0.6 instead of flickering. */
const FAST_SECS = 0.25;

interface ChipKind {
  readonly q: number;
  readonly ai: boolean;
  readonly warn: boolean;
}

let colors: { key: string; C: Colors } | null = null;
const urls = new Map<string, string>();

const colorsOf = (doc: Document): Colors => {
  const key = doc.documentElement.className;
  if (colors?.key !== key) {
    colors = { key, C: readColors(doc) };
    urls.clear();
  }
  return colors.C;
};

/** One document as an image URL, drawn as the canvas draws it. */
export const chipURL = (doc: Document, d: ChipKind): string => {
  const C = colorsOf(doc),
    k = `${d.q}|${d.ai ? 1 : 0}|${d.warn ? 1 : 0}`;
  let url = urls.get(k);
  if (!url) {
    const cv = doc.createElement('canvas');
    cv.width = 40;
    cv.height = 46;
    const c = cv.getContext('2d');
    if (!c) return '';
    c.scale(2, 2);
    drawDoc({ c, C }, { x: 10, y: 11.6, s: 1.55 }, d);
    url = cv.toDataURL();
    urls.set(k, url);
  }
  return url;
};

const setBg = (el: HTMLElement, url: string) => {
  const v = `url(${url})`;
  if (el.style.backgroundImage !== v) el.style.backgroundImage = v;
};

/** The server working on `n` now, or null. */
const serverOf = (n: FactoryNode): Server | null => {
  const sv = n.server;
  return sv && sv.n === n && (sv.busy || sv.blocked) ? sv : null;
};

/** The ring's fill: the job's progress, or 0.6 for a job too short to watch. */
const ringOf = (sv: Server, x: { t: number; speed: number }): string =>
  (sv.end - sv.start) / Math.max(1e-6, x.speed * SPEED_1X) < FAST_SECS ? '0.6' : progressOf(sv, x.t).toFixed(2);

/** A column's ring and document in work, while its own server works on it. */
const drawColumn = (col: HTMLElement, x: { n: FactoryNode; m: Factory; speed: number }) => {
  const ring = col.querySelector<HTMLElement>('[data-r="ring"]'),
    work = col.querySelector<HTMLElement>('[data-r="work"]'),
    sv = serverOf(x.n);
  if (!ring || !work) return;
  ring.style.visibility = sv ? 'visible' : 'hidden';
  if (!sv) return;
  ring.style.setProperty('--p', ringOf(sv, { t: x.m.t, speed: x.speed }));
  const ai = dials(x.n, x.m.s).ai;
  ring.dataset.ai = String(ai);
  setBg(work, chipURL(col.ownerDocument, { q: sv.J.fl & COMPL ? Q.GOOD : sv.J.q, ai, warn: sv.bounce }));
};

/** The newest tokens on a belt, at most 24. */
const ridersOf = (fwd: { readonly n: number; at(i: number): Token }): Token[] => {
  const list: Token[] = [];
  for (let i = fwd.n - 1; i >= 0 && list.length < BELT_CHIPS; i--) list.push(fwd.at(i));
  return list;
};

/** The live flow on the belt between two neighbouring columns. */
const drawBelt = (belt: HTMLElement, x: { tokens: Token[]; t: number }) => {
  const kids = belt.children;
  while (kids.length < x.tokens.length) belt.append(belt.ownerDocument.createElement('i'));
  while (kids.length > x.tokens.length) kids[kids.length - 1]?.remove();
  x.tokens.forEach((tok, i) => {
    const k = kids[i] as HTMLElement,
      f = Math.max(0, Math.min(1, (x.t - tok.t0) / (tok.t1 - tok.t0)));
    k.style.left = `${(f * 100).toFixed(1)}%`;
    setBg(k, chipURL(belt.ownerDocument, { q: tok.q, ai: !!tok.ai, warn: (tok.fl & COMPL) !== 0 }));
  });
};

/** Draws one frame of the stream under `root`; nothing while it is not shown. */
export const drawCompare = (root: HTMLElement | null, run: FactoryRun, speed: number) => {
  if (!root) return;
  const m = run.m;
  for (const col of root.querySelectorAll<HTMLElement>('[data-col]')) {
    const n = m.nodes.get(col.dataset.col ?? '');
    if (n) drawColumn(col, { n, m, speed });
  }
  for (const belt of root.querySelectorAll<HTMLElement>('[data-gbelt]')) {
    const e = m.edges.find((f) => f.key === belt.dataset.gbelt);
    if (e) drawBelt(belt, { tokens: ridersOf(e.fwd), t: m.t });
  }
};
