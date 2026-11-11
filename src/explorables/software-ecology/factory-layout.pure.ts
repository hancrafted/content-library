/*
 * Where the factory is drawn, apart from the model (design-ADR 0024 §19): card boxes, ports, belt corners, junction
 * plates, the sampled belt paths, the rework lanes and the label places. The model knows who hands work to whom; this
 * module knows where. Ported from the reference build's geometry, numbers unchanged (layout units).
 */
import { keyOf, offsetPts, sample, type Path, type Pt } from './factory-paths.pure.ts';
import type { Belt, Factory, NodeDef } from './factory.types';
import type { Route } from './software-ecology.types';

export { offsetD, type Path, type Pt } from './factory-paths.pure.ts';

/** A station card spans x±HALF, y-TOP..y+BOT; belts run at y. */
export const HALF = 110,
  TOP = 48,
  BOT = 44;
/** The document in work sits at x+WX; top and bottom ports sit on that line. */
export const WX = 36;
export const CUST_W = 82,
  CUST_TOP = 128,
  CUST_BOT = 128;
/** A belt runs at least this far straight out of and into a station. */
export const MIN_RUN = 40;
/** A rework lane runs beside its belt, on the left of the direction of travel. */
export const RET = -20;

type Side = NonNullable<Route['out']>;
const isCust = (d: NodeDef) => d.kind === 'customer';
const halfW = (d: NodeDef) => (isCust(d) ? CUST_W : HALF);
const topH = (d: NodeDef) => (isCust(d) ? CUST_TOP : TOP);
const botH = (d: NodeDef) => (isCust(d) ? CUST_BOT : BOT);

/** Where the document in work sits. */
export const workAt = (d: Pick<NodeDef, 'x' | 'y'>): Pt => [d.x + WX, d.y];

/** A card's box: [x, y, width, height]. */
export const boxOf = (d: NodeDef): readonly [number, number, number, number] =>
  isCust(d)
    ? [d.x - CUST_W, d.y - CUST_TOP, CUST_W * 2, CUST_TOP + CUST_BOT]
    : [d.x - HALF, d.y - TOP, HALF * 2, TOP + BOT];

const port = (d: NodeDef, side: Side): Pt => {
  const px = isCust(d) ? d.x : d.x + WX;
  if (side === 'left') return [d.x - halfW(d), d.y];
  if (side === 'top') return [px, d.y - topH(d)];
  if (side === 'bottom') return [px, d.y + botH(d)];
  return [d.x + halfW(d), d.y];
};
const horiz = (side: Side) => side === 'left' || side === 'right';

const sameRow = (p: { p0: Pt; p1: Pt }, k: 0 | 1, mid: number | undefined): Pt[] => {
  const { p0, p1 } = p;
  if (p0[1 - k] === p1[1 - k]) return [p0, p1];
  const m = mid ?? (p0[k] + p1[k]) / 2;
  return k === 0 ? [p0, [m, p0[1]], [m, p1[1]], p1] : [p0, [p0[0], m], [p1[0], m], p1];
};

const elbows = (r: Route, p: { p0: Pt; p1: Pt; outS: Side; inS: Side }): Pt[] => {
  const { p0, p1, outS, inS } = p;
  if (horiz(outS) && horiz(inS)) return sameRow(p, 0, r.xm);
  if (!horiz(outS) && !horiz(inS)) return sameRow(p, 1, r.ym);
  return horiz(outS) ? [p0, [p1[0], p0[1]], p1] : [p0, [p0[0], p1[1]], p1];
};

/** The corners of a belt from A to B along its route hint. */
export const corners = (r: Route, A: NodeDef, B: NodeDef): Pt[] => {
  const outS = r.out ?? 'right',
    p0 = port(A, outS),
    v = (r.via ?? []).map((p): Pt => [p[0], p[1]]);
  const lx = v.length ? (v[v.length - 1] as Pt)[0] : p0[0];
  const inS = r.in ?? (lx > B.x ? 'right' : 'left'),
    p1 = port(B, inS);
  return v.length ? [p0, ...v, p1] : elbows(r, { p0, p1, outS, inS });
};

const onSeg = (p: Pt, a: Pt, b: Pt): boolean =>
  a[0] === b[0]
    ? Math.abs(p[0] - a[0]) < 0.5 && p[1] >= Math.min(a[1], b[1]) - 0.5 && p[1] <= Math.max(a[1], b[1]) + 0.5
    : Math.abs(p[1] - a[1]) < 0.5 && p[0] >= Math.min(a[0], b[0]) - 0.5 && p[0] <= Math.max(a[0], b[0]) + 0.5;

/** A corner of one belt that lies on another belt is a transfer: drawn square, with a plate. */
export const junctions = (all: readonly (readonly Pt[])[]): Map<string, Pt> => {
  const J = new Map<string, Pt>();
  all.forEach((c, ei) => {
    for (const p of c.slice(1, -1))
      all.forEach((f, fi) => {
        if (fi !== ei && f.some((q, j) => j > 0 && onSeg(p, f[j - 1] as Pt, q))) J.set(keyOf(p), p);
      });
  });
  return J;
};

/** One belt drawn: its corners, its path, the path from the document in work, and its rework lane. */
export interface BeltLayout {
  readonly key: string;
  readonly over: boolean;
  /** Whether the belt has a rework lane. */
  readonly returns: boolean;
  readonly corners: readonly Pt[];
  readonly path: Path;
  /** From the sender's document in work, out of the card and along the belt. */
  readonly vis: Path;
  /** The stretch of `vis` inside the sender's card. */
  readonly inner: number;
  /** The rework lane, from the receiver's document in work back to the sender. */
  readonly retVis: Path;
  /** The rework lane beside the belt, as drawn. */
  readonly retPts: readonly Pt[];
}

const beltLayout = (e: Belt, c: readonly Pt[], J: ReadonlyMap<string, Pt>): BeltLayout => {
  const path = sample(c, J);
  const w0 = e.from.kind === 'role' ? [workAt(e.from.def)] : [];
  const off = offsetPts(path, RET);
  const back = [...off].reverse();
  return {
    key: e.key,
    over: e.over,
    returns: e.returns,
    corners: c,
    path,
    vis: w0.length ? sample([...w0, ...c], J) : path,
    inner: w0.length ? Math.hypot((c[0] as Pt)[0] - (w0[0] as Pt)[0], (c[0] as Pt)[1] - (w0[0] as Pt)[1]) : 0,
    retVis: sample(e.to.kind === 'role' ? [workAt(e.to.def), ...back] : back),
    retPts: off,
  };
};

/** The whole floor: every belt by key, in model order, and the junction plates. */
export interface FactoryLayout {
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly belts: Readonly<Record<string, BeltLayout>>;
  readonly order: readonly string[];
  readonly plates: readonly Pt[];
}

export const layoutFactory = (m: Pick<Factory, 'B' | 'edges'>): FactoryLayout => {
  const routes = m.B.data.routes ?? {},
    all = m.edges.map((e) => corners(routes[e.key] ?? {}, e.from.def, e.to.def));
  const J = junctions(all);
  const belts = Object.fromEntries(m.edges.map((e, i) => [e.key, beltLayout(e, all[i] as Pt[], J)]));
  const { width, height, top = 0 } = m.B.data.layout;
  return { width, height, top, belts, order: m.edges.map((e) => e.key), plates: [...J.values()] };
};

/** The length of each straight run of a belt. */
export const beltSegments = (c: readonly Pt[]): number[] =>
  c.slice(1).map((p, i) => Math.hypot(p[0] - (c[i] as Pt)[0], p[1] - (c[i] as Pt)[1]));
