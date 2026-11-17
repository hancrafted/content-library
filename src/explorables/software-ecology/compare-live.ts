// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { drawDoc, readColors, type Colors } from './doc-sprites.ts';
import type { Floor, FloorDoc, FloorList, FloorStation, FloorWork } from './factory-model.pure.ts';
import { WEEKS_PER_REAL_SECOND_AT_1X } from './factory-run.pure.ts';
import { progressOf } from './paint-rack.ts';

const BELT_CHIPS = 24;
const SHORT_JOB_SECONDS = 0.25;

interface ChipKind {
  readonly good: boolean;
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

export const chipURL = (doc: Document, d: ChipKind): string => {
  const C = colorsOf(doc),
    k = `${d.good ? 1 : 0}|${d.ai ? 1 : 0}|${d.warn ? 1 : 0}`;
  let url = urls.get(k);
  if (!url) {
    const cv = doc.createElement('canvas');
    cv.width = 40;
    cv.height = 46;
    const c = cv.getContext('2d');
    if (!c) return '';
    c.scale(2, 2);
    drawDoc({ c, C }, { x: 10, y: 11.6, s: 1.55 }, { q: d.good ? 1 : 0, ai: d.ai, warn: d.warn });
    url = cv.toDataURL();
    urls.set(k, url);
  }
  return url;
};

const setBg = (el: HTMLElement, url: string) => {
  const v = `url(${url})`;
  if (el.style.backgroundImage !== v) el.style.backgroundImage = v;
};

const ringOf = (sv: FloorWork, x: { t: number; speed: number }): string =>
  (sv.end - sv.start) / Math.max(1e-6, x.speed * WEEKS_PER_REAL_SECOND_AT_1X) < SHORT_JOB_SECONDS
    ? '0.6'
    : progressOf(sv, x.t).toFixed(2);

const drawColumn = (col: HTMLElement, x: { n: FloorStation; t: number; speed: number }) => {
  const ring = col.querySelector<HTMLElement>('[data-r="ring"]'),
    work = col.querySelector<HTMLElement>('[data-r="work"]'),
    sv = x.n.work;
  if (!ring || !work) return;
  ring.style.visibility = sv ? 'visible' : 'hidden';
  if (!sv) return;
  ring.style.setProperty('--p', ringOf(sv, { t: x.t, speed: x.speed }));
  const ai = x.n.ai;
  ring.dataset.ai = String(ai);
  setBg(work, chipURL(col.ownerDocument, { good: sv.doc.complaint || sv.doc.good, ai, warn: sv.bounce }));
};

const ridersOf = (fwd: FloorList<FloorDoc>): FloorDoc[] => {
  const list: FloorDoc[] = [];
  for (let i = fwd.n - 1; i >= 0 && list.length < BELT_CHIPS; i--) list.push(fwd.at(i));
  return list;
};

const drawBelt = (belt: HTMLElement, x: { tokens: FloorDoc[]; t: number }) => {
  const kids = belt.children;
  while (kids.length < x.tokens.length) belt.append(belt.ownerDocument.createElement('i'));
  while (kids.length > x.tokens.length) kids[kids.length - 1]?.remove();
  x.tokens.forEach((tok, i) => {
    const k = kids[i] as HTMLElement,
      f = Math.max(0, Math.min(1, (x.t - tok.t0) / (tok.t1 - tok.t0)));
    k.style.left = `${(f * 100).toFixed(1)}%`;
    setBg(k, chipURL(belt.ownerDocument, { good: tok.good, ai: !!tok.ai, warn: tok.complaint }));
  });
};

const drawBeltOf = (belt: HTMLElement, floor: Floor) => {
  const e = floor.belt(belt.dataset.gbelt ?? '');
  if (e) drawBelt(belt, { tokens: ridersOf(e.fwd), t: floor.t });
};

export const drawCompare = (root: HTMLElement | null, floor: Floor, speed: number) => {
  if (!root) return;
  for (const col of root.querySelectorAll<HTMLElement>('[data-col]')) {
    const n = floor.station(col.dataset.col ?? '');
    if (n) drawColumn(col, { n, t: floor.t, speed });
  }
  for (const belt of root.querySelectorAll<HTMLElement>('[data-gbelt]')) drawBeltOf(belt, floor);
};
