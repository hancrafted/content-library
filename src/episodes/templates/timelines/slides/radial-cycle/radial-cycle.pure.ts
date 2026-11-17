/*
 * The cycle's clock-face geometry: where each phase's arc runs, which way its
 * label reads, and how far a phase pops outward.
 * Angles are degrees clockwise from 12 o'clock; y grows downward as in SVG.
 * No DOM, no React.
 */

export const CYCLE_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type CycleItem = (typeof CYCLE_ITEMS)[number];

export const RING = {
  size: 400,
  centre: 200,
  radius: 140,
  stroke: 44,
  gapDegrees: 2,
} as const;

export const POP_DISTANCE = 10;

export const HAND_TURN_S = 60;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PhaseArc {
  readonly startDegrees: number;
  readonly endDegrees: number;
  readonly midDegrees: number;
  readonly path: string;
  readonly labelAt: Point;
  /** How far its label turns to follow the ring: the tangent on the top half, half a turn more on the bottom half so it never reads upside down. */
  readonly labelTurnDegrees: number;
}

export interface Tick {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

function assertInCycle(index: number, count: number): void {
  if (!Number.isInteger(count) || count < 1) throw new Error(`A cycle needs at least one phase, not ${count}.`);
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new Error(`${index} is not a phase of a cycle of ${count}.`);
  }
}

/** Two decimals keep the SVG strings short and stable; `+ 0` turns -0 into 0. */
function round(value: number): number {
  return Math.round(value * 100) / 100 + 0;
}

export function polarPoint(angleDegrees: number, radius: number): Point {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: round(RING.centre + radius * Math.sin(radians)),
    y: round(RING.centre - radius * Math.cos(radians)),
  };
}

function arcPath(fromDegrees: number, toDegrees: number): string {
  const from = polarPoint(fromDegrees, RING.radius);
  const to = polarPoint(toDegrees, RING.radius);
  const large = toDegrees - fromDegrees > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${RING.radius} ${RING.radius} 0 ${large} 1 ${to.x} ${to.y}`;
}

export function phaseArc(index: number, count: number): PhaseArc {
  assertInCycle(index, count);
  const share = 360 / count;
  const startDegrees = share * index + RING.gapDegrees / 2;
  const endDegrees = share * (index + 1) - RING.gapDegrees / 2;
  const midDegrees = share * index + share / 2;
  const bottomHalf = midDegrees > 90 && midDegrees < 270;
  return {
    startDegrees,
    endDegrees,
    midDegrees,
    path: arcPath(startDegrees, endDegrees),
    labelAt: polarPoint(midDegrees, RING.radius),
    labelTurnDegrees: bottomHalf ? midDegrees - 180 : midDegrees,
  };
}

export function popOffset(index: number, count: number, distance: number): Point {
  const { midDegrees } = phaseArc(index, count);
  const tip = polarPoint(midDegrees, distance);
  return { x: round(tip.x - RING.centre), y: round(tip.y - RING.centre) };
}

export function tickMarks(count: number): Tick[] {
  const inner = RING.radius + RING.stroke / 2 + 6;
  const outer = inner + 8;
  return Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index;
    const from = polarPoint(angle, inner);
    const to = polarPoint(angle, outer);
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  });
}
