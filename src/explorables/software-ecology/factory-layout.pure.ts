// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { NodeDef, TopoBelt, Topology } from './factory-model.pure.ts';
import { keyOf, offsetPts, sample, type Path, type Pt } from './factory-paths.pure.ts';
import type { Route } from './software-ecology.types';

export { offsetD, type Path, type Pt } from './factory-paths.pure.ts';

export const HALF = 110,
  TOP = 71,
  BOT = 43,
  HEAD = 28;
export const WX = 25;
export const BELT_W = 22,
  RETURN_W = 13;
export const CUST_W = 107,
  CUST_TOP = 128,
  CUST_BOT = 128;
export const MIN_RUN = 40;
export const RET = -20;

type Side = NonNullable<Route['out']>;
const isCust = (d: NodeDef) => d.kind === 'customer';
const halfW = (d: NodeDef) => (isCust(d) ? CUST_W : HALF);
const topH = (d: NodeDef) => (isCust(d) ? CUST_TOP : TOP);
const botH = (d: NodeDef) => (isCust(d) ? CUST_BOT : BOT);

export const workAt = (d: Pick<NodeDef, 'x' | 'y'>): Pt => [d.x + WX, d.y];

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

export interface BeltLayout {
  readonly key: string;
  readonly over: boolean;
  readonly returns: boolean;
  readonly corners: readonly Pt[];
  readonly path: Path;
  readonly vis: Path;
  readonly inner: number;
  readonly retVis: Path;
  readonly retPts: readonly Pt[];
}

const beltLayout = (e: TopoBelt, c: readonly Pt[], J: ReadonlyMap<string, Pt>): BeltLayout => {
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

export interface FactoryLayout {
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly belts: Readonly<Record<string, BeltLayout>>;
  readonly order: readonly string[];
  readonly plates: readonly Pt[];
}

export const layoutFactory = (m: Pick<Topology, 'B' | 'edges'>): FactoryLayout => {
  const routes = m.B.data.routes ?? {},
    all = m.edges.map((e) => corners(routes[e.key] ?? {}, e.from.def, e.to.def));
  const J = junctions(all);
  const belts = Object.fromEntries(m.edges.map((e, i) => [e.key, beltLayout(e, all[i] as Pt[], J)]));
  const { width, height, top = 0 } = m.B.data.layout;
  return { width, height, top, belts, order: m.edges.map((e) => e.key), plates: [...J.values()] };
};

export const beltSegments = (c: readonly Pt[]): number[] =>
  c.slice(1).map((p, i) => Math.hypot(p[0] - (c[i] as Pt)[0], p[1] - (c[i] as Pt)[1]));
