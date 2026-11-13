/*
 * Sampled belt paths (design-ADR 0024 §19): a polyline of corners becomes a path with rounded corners, sampled every
 * three layout units, with its cumulative length, so the painter finds the point at any distance along it. Corners
 * that are junctions stay square. A line-for-line port of the reference build's `sample`, `at` and `offsetD`.
 */

export type Pt = readonly [number, number];

/** A sampled path: its points, the length up to each, its whole length and its SVG `d`. */
export interface Path {
  readonly pts: readonly Pt[];
  readonly cum: readonly number[];
  readonly L: number;
  readonly d: string;
}

/** Belt corner radius, in layout units. */
export const R = 14;

export const keyOf = (p: Pt): string => `${Math.round(p[0])},${Math.round(p[1])}`;

const dist = (a: Pt, b: Pt): number => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Pushes points every three units to (x, y), skipping a repeat. */
const liner = (out: Pt[]) => {
  const push = (x: number, y: number) => {
    const l = out[out.length - 1];
    if (!l || Math.hypot(l[0] - x, l[1] - y) > 0.01) out.push([x, y]);
  };
  const line = (x: number, y: number) => {
    const l = out[out.length - 1] as Pt,
      n = Math.max(1, Math.ceil(Math.hypot(x - l[0], y - l[1]) / 3));
    for (let k = 1; k <= n; k++) push(l[0] + ((x - l[0]) * k) / n, l[1] + ((y - l[1]) * k) / n);
  };
  return { push, line };
};

interface Corner {
  readonly a: Pt;
  readonly c: Pt;
  readonly next: Pt;
}

/** A rounded corner at `c` between `a` and `next`: where it starts and ends. */
const rounded = ({ a, c, next }: Corner) => {
  const l1 = dist(a, c),
    l2 = dist(c, next),
    r = Math.min(R, l1 / 2, l2 / 2);
  const e: Pt = [c[0] - ((c[0] - a[0]) / l1) * r, c[1] - ((c[1] - a[1]) / l1) * r];
  const f: Pt = [c[0] + ((next[0] - c[0]) / l2) * r, c[1] + ((next[1] - c[1]) / l2) * r];
  return { e, f };
};

const curve = (push: (x: number, y: number) => void, e: Pt, k: { c: Pt; f: Pt }) => {
  for (let i = 1; i <= 8; i++) {
    const t = i / 8,
      u = 1 - t;
    push(u * u * e[0] + 2 * u * t * k.c[0] + t * t * k.f[0], u * u * e[1] + 2 * u * t * k.c[1] + t * t * k.f[1]);
  }
};

const lengths = (out: readonly Pt[]): number[] => {
  const cum = [0];
  for (let i = 1; i < out.length; i++) cum.push((cum[i - 1] as number) + dist(out[i - 1] as Pt, out[i] as Pt));
  return cum;
};

/** Samples a polyline into a path; a corner in `J` stays square. */
export const sample = (raw: readonly Pt[], J: ReadonlyMap<string, Pt> = new Map()): Path => {
  const pts: Pt[] = raw.filter((p, i) => i === 0 || dist(raw[i - 1] as Pt, p) > 0.01).map((p) => [p[0], p[1]]);
  const out: Pt[] = [],
    { push, line } = liner(out),
    first = pts[0] as Pt;
  let d = `M${first[0]} ${first[1]}`;
  push(first[0], first[1]);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as Pt,
      c = pts[i] as Pt,
      next = pts[i + 1];
    if (next && !J.has(keyOf(c))) {
      const { e, f } = rounded({ a, c, next });
      line(e[0], e[1]);
      d += ` L${e[0]} ${e[1]} Q${c[0]} ${c[1]} ${f[0]} ${f[1]}`;
      curve(push, e, { c, f });
      pts[i] = f;
    } else {
      line(c[0], c[1]);
      d += ` L${c[0]} ${c[1]}`;
    }
  }
  const cum = lengths(out);
  return { pts: out, cum, L: cum[cum.length - 1] as number, d };
};

/** The point at distance `s` along a path, and its left normal: [x, y, nx, ny]. Written into one shared array. */
const AT: [number, number, number, number] = [0, 0, 0, 1];
export const at = (path: Path, s: number): readonly [number, number, number, number] => {
  const { pts, cum, L } = path;
  const v = s < 0 ? 0 : s > L ? L : s;
  let lo = 0,
    hi = cum.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if ((cum[m] as number) <= v) lo = m;
    else hi = m;
  }
  const a = pts[lo] as Pt,
    b = pts[hi] as Pt,
    seg = (cum[hi] as number) - (cum[lo] as number) || 1,
    t = (v - (cum[lo] as number)) / seg;
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    l = Math.hypot(dx, dy) || 1;
  AT[0] = a[0] + dx * t;
  AT[1] = a[1] + dy * t;
  AT[2] = -dy / l;
  AT[3] = dx / l;
  return AT;
};

/** The points of a path moved `off` along its normal. */
export const offsetPts = (path: Path, off: number): Pt[] =>
  path.pts.map((_, i) => {
    const [x, y, nx, ny] = at(path, path.cum[i] as number);
    return [x + nx * off, y + ny * off];
  });

/** The SVG `d` of a path moved `off` along its normal. */
export const offsetD = (path: Path, off: number): string =>
  offsetPts(path, off)
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
