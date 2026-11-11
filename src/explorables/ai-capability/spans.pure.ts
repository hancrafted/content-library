import { LEVELS, type Level } from './scene-frames.pure';

/*
 * The geometry of the two layer rows, AI disciplines and Oversight. An item spans the Levels from one edge to another;
 * a position runs from 0 (the start of Prompting) to 4 (the end of Factory). Wide, a row draws each span across the
 * four columns; narrow, each Level's card draws its slice of it. Views only place what this module computes.
 */

/** Where in a Level a span starts or ends. */
export type Edge = 'start' | 'mid' | 'end';

/** One end of a span: a Level and an edge of it, as the config names it. */
export interface SpanEnd {
  readonly level: Level;
  readonly at: Edge;
}

/** A span's strength along its length: [where, 0 to 1 along the span; how strong, 0 to 1]. */
export type Stops = readonly (readonly [number, number])[];

/** A span on the 0 to 4 axis. */
export type Range = readonly [number, number];

const EDGE: Record<Edge, number> = { start: 0, mid: 0.5, end: 1 };

const position = (end: SpanEnd) => LEVELS.indexOf(end.level) + EDGE[end.at];

/** The span between two ends, as positions on the four Levels. */
export function spanRange(from: SpanEnd, to: SpanEnd): [number, number] {
  return [position(from), position(to)];
}

/** One Level's cut of a span, in percent of its card, and whether the span runs on into the next card. */
export interface Slice {
  readonly left: number;
  readonly width: number;
  readonly continues: boolean;
}

/** The part of a span inside one Level's card; none when the span misses the Level or only touches its edge. */
export function sliceOf([from, to]: Range, level: Level): Slice | null {
  const start = LEVELS.indexOf(level);
  const low = Math.max(from, start);
  const high = Math.min(to, start + 1);
  if (high <= low) return null;
  return { left: (low - start) * 100, width: (high - low) * 100, continues: to > start + 1 };
}

/** A span with no stops in the config is drawn at one even strength. */
const EVEN: Stops = [
  [0, 0.6],
  [1, 0.6],
];

/** The strength at a point along the span (0 to 1), read between the two stops around it. */
function strengthAt(stops: Stops, along: number): number {
  const after = stops.findIndex(([at]) => at >= along);
  if (after <= 0) return stops[Math.max(after, 0)]?.[1] ?? 0;
  const [lowAt, lowStrength] = stops[after - 1] ?? [0, 0];
  const [highAt, highStrength] = stops[after] ?? [1, 0];
  return lowStrength + ((along - lowAt) / (highAt - lowAt)) * (highStrength - lowStrength);
}

/** The strength stops of the drawn part of a span, at percent of that part: its two ends and every stop between. */
export function fadeStops(
  stops: Stops | undefined,
  [from, to]: Range,
  [shownFrom, shownTo]: Range,
): { at: number; strength: number }[] {
  const all = stops ?? EVEN;
  const along = (place: number) => (place - from) / (to - from);
  const [low, high] = [along(shownFrom), along(shownTo)];
  const inner = all.filter(([at]) => at > low && at < high).map(([at]) => at);
  return [low, ...inner, high].map((at) => ({
    at: Math.round(((at - low) / (high - low)) * 100),
    strength: Math.round(strengthAt(all, at) * 100) / 100,
  }));
}
