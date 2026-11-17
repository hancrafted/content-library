import { LEVELS, type Level } from './scene-frames.pure';

export type Edge = 'start' | 'mid' | 'end';

export interface SpanEnd {
  readonly level: Level;
  readonly at: Edge;
}

export type Stops = readonly (readonly [alongRatio: number, strengthRatio: number])[];

export type Range = readonly [number, number];

const EDGE: Record<Edge, number> = { start: 0, mid: 0.5, end: 1 };

const position = (end: SpanEnd) => LEVELS.indexOf(end.level) + EDGE[end.at];

export function spanRange(from: SpanEnd, to: SpanEnd): [number, number] {
  return [position(from), position(to)];
}

export interface Slice {
  readonly leftPercent: number;
  readonly widthPercent: number;
  readonly continues: boolean;
}

export function sliceOf([from, to]: Range, level: Level): Slice | null {
  const start = LEVELS.indexOf(level);
  const low = Math.max(from, start);
  const high = Math.min(to, start + 1);
  if (high <= low) return null;
  return { leftPercent: (low - start) * 100, widthPercent: (high - low) * 100, continues: to > start + 1 };
}

const EVEN: Stops = [
  [0, 0.6],
  [1, 0.6],
];

function strengthAt(stops: Stops, along: number): number {
  const after = stops.findIndex(([at]) => at >= along);
  if (after <= 0) return stops[Math.max(after, 0)]?.[1] ?? 0;
  const [lowAt, lowStrength] = stops[after - 1] ?? [0, 0];
  const [highAt, highStrength] = stops[after] ?? [1, 0];
  return lowStrength + ((along - lowAt) / (highAt - lowAt)) * (highStrength - lowStrength);
}

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
