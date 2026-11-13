/*
 * The scenery's geometry: which parts of the iceberg show, how deep its keel reaches, and where a school, a bloom of
 * jellies or a column of bubbles sits. Deterministic: a seed, never `Math.random`, so every render of a Slide draws
 * the same sea.
 */
import { ICEBERG_HALF_WIDTH, KEEL_DEPTH, TIP_HEIGHT } from './facet-data';

/** Which part of the iceberg a Scene shows: all of it, only what floats above the waterline, or only the keel below. */
export type IcebergPart = 'whole' | 'tip' | 'keel';

export interface IcebergLayers {
  readonly tip: boolean;
  readonly keel: boolean;
  /** The bright line where the ice meets the water, drawn whenever the tip is. */
  readonly glow: boolean;
}

/** The iceberg's layers for a part. */
export function icebergLayers(part: IcebergPart): IcebergLayers {
  return { tip: part !== 'keel', keel: part !== 'tip', glow: part !== 'keel' };
}

/** The depth scale that puts the keel's point at `keelY` when the waterline sits at `waterline`. */
export function depthScaleForKeel(waterline: number, keelY: number): number {
  if (keelY <= waterline) throw new Error(`The keel must sit below the waterline (${waterline}), got ${keelY}.`);
  return (keelY - waterline) / KEEL_DEPTH;
}

export interface IcebergExtent {
  /** Above the waterline, negative, in the Scene's units. */
  readonly top: number;
  /** Below the waterline, positive, in the Scene's units. */
  readonly bottom: number;
  readonly halfWidth: number;
}

/** How far the drawn part reaches from the waterline, so a Scene can frame it. */
export function icebergExtent(part: IcebergPart, scale = 1, depthScale = 1): IcebergExtent {
  if (scale <= 0 || depthScale <= 0)
    throw new Error(`An iceberg needs a positive scale, got ${scale} and ${depthScale}.`);
  const layers = icebergLayers(part);
  return {
    top: layers.tip ? -TIP_HEIGHT * scale : 0,
    bottom: layers.keel ? KEEL_DEPTH * depthScale * scale : 0,
    halfWidth: ICEBERG_HALF_WIDTH * scale,
  };
}

/** A seeded generator in [0, 1): mulberry32, small and good enough to scatter fish. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where one creature of a group sits, relative to the group's centre, and how large it is. */
export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly s: number;
}

export interface ScatterOptions {
  readonly count: number;
  readonly seed: number;
  /** Half the group's width and height. */
  readonly spread: readonly [number, number];
  /** The least distance two members keep, across and down, so none overlap. */
  readonly gap: readonly [number, number];
  /** The size range around 1. */
  readonly sizes?: readonly [number, number];
}

const TRIES_PER_MEMBER = 12;

/** Scatters `count` members in a box without overlaps, as `parts.py` `school` does; fewer if crowded. */
export function scatter({ count, seed, spread, gap, sizes = [0.8, 1.15] }: ScatterOptions): readonly Placement[] {
  if (!Number.isInteger(count) || count < 0)
    throw new Error(`A group needs a whole count of zero or more, got ${count}.`);
  const random = seededRandom(seed);
  const placed: Placement[] = [];
  for (let tries = 0; tries < count * TRIES_PER_MEMBER && placed.length < count; tries++) {
    const x = Math.round((random() * 2 - 1) * spread[0]);
    const y = Math.round((random() * 2 - 1) * spread[1]);
    const s = Math.round((sizes[0] + random() * (sizes[1] - sizes[0])) * 100) / 100;
    if (placed.some((p) => Math.abs(p.x - x) < gap[0] && Math.abs(p.y - y) < gap[1])) continue;
    placed.push({ x, y, s });
  }
  return placed;
}

/** A polygon as an SVG `points` value, one decimal. */
export function toPoints(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}

const round = (value: number) => Math.round(value * 10) / 10;

export interface RayOptions {
  readonly count: number;
  readonly spread: number;
  readonly length: number;
  readonly seed: number;
}

/** Sun shafts slanting down to the right from the waterline, as `parts.py` `rays`: thin translucent wedges. */
export function rayWedges({ count, spread, length, seed }: RayOptions): readonly string[] {
  if (!Number.isInteger(count) || count < 0) throw new Error(`Rays need a whole count of zero or more, got ${count}.`);
  const random = seededRandom(seed);
  const slant = length * 0.35;
  return Array.from({ length: count }, (_, index) => {
    const x = index * spread + (random() * 20 - 10);
    const w = 10 + random() * 12;
    return toPoints([
      [x, 0],
      [x + w, 0],
      [x + w * 0.4 + slant, length],
      [x + slant - w * 0.2, length],
    ]);
  });
}

/** A bubble: a hexagon of radius `r` with a glint at its upper left, as `parts.py` `bubbles`. */
export function bubbleShape(r: number): { readonly body: string; readonly glint: string } {
  const body = Array.from({ length: 6 }, (_, k) => {
    const a = (k * Math.PI) / 3;
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });
  return {
    body: toPoints(body),
    glint: toPoints([
      [-r * 0.5, -r * 0.2],
      [-r * 0.1, -r * 0.65],
      [-r * 0.05, -r * 0.2],
    ]),
  };
}

/** One facet of a low-poly disc: a polygon and whether it faces the light at the upper left. */
export interface DiscFacet {
  readonly points: string;
  readonly lit: boolean;
}

const SUN_SIDES = 12;

/** The sun as a fan of triangles around its centre; the facets toward the upper left are lit. */
export function sunFacets(r: number): readonly DiscFacet[] {
  return Array.from({ length: SUN_SIDES }, (_, k) => {
    const a0 = (k * 2 * Math.PI) / SUN_SIDES;
    const a1 = ((k + 1) * 2 * Math.PI) / SUN_SIDES;
    const mid = (a0 + a1) / 2;
    return {
      points: toPoints([
        [0, 0],
        [r * Math.cos(a0), r * Math.sin(a0)],
        [r * Math.cos(a1), r * Math.sin(a1)],
      ]),
      lit: facesLight(Math.cos(mid), Math.sin(mid)),
    };
  });
}

/** True for a direction toward the upper left, where every scene's light comes from. */
const facesLight = (dx: number, dy: number) => -0.55 * dx - 0.75 * dy > 0;

const CRESCENT_STEPS = 6;

/**
 * A waxing crescent of radius `r`: the disc less a second disc pushed to the upper right, as the landing window's
 * moon mask draws it. Built as quads between the outer rim and the cut's rim, from horn to horn, so it needs no mask.
 */
export function crescentFacets(r: number): readonly DiscFacet[] {
  const cut = { x: r * 0.52, y: -r * 0.32, r: r * 0.9 };
  const [hornA, hornB] = circleCrossings(r, cut);
  // The outer rim runs the long way round, away from the cut; the inner rim is the cut's arc inside the disc.
  const outerFrom = Math.atan2(hornA[1], hornA[0]);
  let outerTo = Math.atan2(hornB[1], hornB[0]);
  const away = Math.atan2(-cut.y, -cut.x);
  outerTo = longWayRound(outerFrom, outerTo, away);
  const innerFrom = Math.atan2(hornA[1] - cut.y, hornA[0] - cut.x);
  let innerTo = Math.atan2(hornB[1] - cut.y, hornB[0] - cut.x);
  innerTo = shortWayRound(innerFrom, innerTo);
  const at = (t: number) => {
    const ao = outerFrom + (outerTo - outerFrom) * t;
    const ai = innerFrom + (innerTo - innerFrom) * t;
    return {
      outer: [r * Math.cos(ao), r * Math.sin(ao)] as const,
      inner: [cut.x + cut.r * Math.cos(ai), cut.y + cut.r * Math.sin(ai)] as const,
    };
  };
  return Array.from({ length: CRESCENT_STEPS }, (_, k) => {
    const a = at(k / CRESCENT_STEPS);
    const b = at((k + 1) / CRESCENT_STEPS);
    const cx = (a.outer[0] + b.outer[0]) / 2;
    const cy = (a.outer[1] + b.outer[1]) / 2;
    return { points: toPoints([a.outer, b.outer, b.inner, a.inner]), lit: facesLight(cx, cy) };
  });
}

type Point = readonly [number, number];

/** Where the disc of radius `r` at the origin crosses the cut circle. */
function circleCrossings(r: number, cut: { x: number; y: number; r: number }): readonly [Point, Point] {
  const d = Math.hypot(cut.x, cut.y);
  const a = (r * r - cut.r * cut.r + d * d) / (2 * d);
  const h = Math.sqrt(r * r - a * a);
  const mx = (a * cut.x) / d;
  const my = (a * cut.y) / d;
  return [
    [mx + (h * cut.y) / d, my - (h * cut.x) / d],
    [mx - (h * cut.y) / d, my + (h * cut.x) / d],
  ];
}

const TAU = 2 * Math.PI;

/** The end angle reached from `from` by the arc that passes through `via`. */
function longWayRound(from: number, to: number, via: number): number {
  const span = (((to - from) % TAU) + TAU) % TAU;
  const viaSpan = (((via - from) % TAU) + TAU) % TAU;
  return viaSpan < span ? from + span : from + span - TAU;
}

/** The end angle reached from `from` by the shorter arc. */
function shortWayRound(from: number, to: number): number {
  let span = (((to - from) % TAU) + TAU) % TAU;
  if (span > Math.PI) span -= TAU;
  return from + span;
}
