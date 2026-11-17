import type { PopoverRules } from '@/shared/lib/popover-placement.pure';

export interface Point {
  readonly x: number;
  readonly y: number;
}

function fmt(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function assertMetroSegment(from: Point, to: Point): void {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if ((dx === 0 && dy === 0) || (dx !== 0 && dy !== 0 && dx !== dy)) {
    throw new Error(`The segment to ${to.x} ${to.y} is neither straight nor at 45°.`);
  }
}

function toward(from: Point, to: Point, distance: number): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return { x: from.x + ((to.x - from.x) * distance) / length, y: from.y + ((to.y - from.y) * distance) / length };
}

export function metroPath(points: readonly Point[], radius: number): string {
  if (points.length === 0) throw new Error('A route with no points draws nothing.');
  points.slice(1).forEach((to, index) => assertMetroSegment(points[index], to));
  const [first, ...rest] = points;
  const last = rest.pop();
  const bends = rest.map((corner, index) => {
    const before = toward(corner, points[index], radius);
    const after = toward(corner, points[index + 2], radius);
    return `L ${fmt(before.x)} ${fmt(before.y)} Q ${fmt(corner.x)} ${fmt(corner.y)} ${fmt(after.x)} ${fmt(after.y)}`;
  });
  const end = last === undefined ? [] : [`L ${fmt(last.x)} ${fmt(last.y)}`];
  return [`M ${fmt(first.x)} ${fmt(first.y)}`, ...bends, ...end].join(' ');
}

export const CANVAS = { width: 1000, height: 380 } as const;

export const LANES = ['a', 'b', 'c'] as const;

export type Lane = (typeof LANES)[number];

export const STATIONS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type Station = (typeof STATIONS)[number];

const TRUNK = 180;
const BUNDLE = 12;
const TOP = 70;
const BOTTOM = 300;

export const LANE_ROUTES: Record<Lane, readonly Point[]> = {
  a: [
    { x: 40, y: TRUNK },
    { x: 960, y: TRUNK },
  ],
  b: [
    { x: 40, y: TRUNK - BUNDLE },
    { x: 120, y: TRUNK - BUNDLE },
    { x: 218, y: TOP },
    { x: 300, y: TOP },
    { x: 398, y: TRUNK - BUNDLE },
    { x: 820, y: TRUNK - BUNDLE },
    { x: 918, y: TOP },
    { x: 960, y: TOP },
  ],
  c: [
    { x: 40, y: TRUNK + BUNDLE },
    { x: 150, y: TRUNK + BUNDLE },
    { x: 258, y: BOTTOM },
    { x: 630, y: BOTTOM },
    { x: 738, y: TRUNK + BUNDLE },
    { x: 960, y: TRUNK + BUNDLE },
  ],
};

export const STATION_AT: Record<Station, Point> = {
  a: { x: 90, y: TRUNK },
  b: { x: 260, y: TOP },
  c: { x: 430, y: TRUNK - BUNDLE / 2 },
  d: { x: 600, y: BOTTOM },
  e: { x: 760, y: TRUNK },
  f: { x: 940, y: TOP },
};

export const LABEL_SIDE: Record<Station, 'above' | 'below'> = {
  a: 'below',
  b: 'above',
  c: 'below',
  d: 'below',
  e: 'above',
  f: 'above',
};

export function canvasShare(point: Point): { left: string; top: string } {
  return { left: `${(point.x / CANVAS.width) * 100}%`, top: `${(point.y / CANVAS.height) * 100}%` };
}

const CATCHMENT = 20;

function distanceToSegment(point: Point, from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const share = Math.min(1, Math.max(0, ((point.x - from.x) * dx + (point.y - from.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (from.x + share * dx), point.y - (from.y + share * dy));
}

export function stationLanes(station: Station): Lane[] {
  const at = STATION_AT[station];
  return LANES.filter((lane) =>
    LANE_ROUTES[lane].slice(1).some((to, index) => distanceToSegment(at, LANE_ROUTES[lane][index], to) <= CATCHMENT),
  );
}

export function isInterchange(station: Station): boolean {
  return stationLanes(station).length > 1;
}

export type MapFocus = { lane: Lane } | { station: Station } | null;

export function litLanes(focus: MapFocus): Lane[] {
  if (focus === null) return [...LANES];
  return 'lane' in focus ? [focus.lane] : stationLanes(focus.station);
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (match === null) throw new Error(`${hex} is not a six-digit hex colour.`);
  const [r, g, b] = match.slice(1).map((pair) => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

export const POPOVER_RULES: PopoverRules = {
  maxWidth: 288,
  gap: 12,
  minRoom: 180,
};
