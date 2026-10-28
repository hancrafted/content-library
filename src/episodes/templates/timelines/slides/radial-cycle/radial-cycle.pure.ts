/*
 * The cycle's clock-face geometry: where each phase's arc runs, which way its
 * label reads, and how far a phase pops outward.
 * Angles are degrees clockwise from 12 o'clock; y grows downward as in SVG.
 * No DOM, no React.
 */

/** The phases around the face, in order; each names its Translation keys under `items.<key>`. */
export const CYCLE_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type CycleItem = (typeof CYCLE_ITEMS)[number];

/** The face in SVG user units: a square `size` wide, the ring's stroke centred on `radius`. */
export const RING = {
  size: 400,
  centre: 200,
  radius: 140,
  stroke: 44,
  /** The empty wedge between neighbouring phases. */
  gapDeg: 2,
} as const;

/** How far a hovered or focused phase moves out from the centre. */
export const POP_DISTANCE = 10;

/** How long the "now" hand takes for one turn of the face. */
export const HAND_TURN_S = 60;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PhaseArc {
  readonly startDeg: number;
  readonly endDeg: number;
  readonly midDeg: number;
  /** The phase's stroke, clockwise along the ring. */
  readonly path: string;
  /** Where its date label sits: on the ring, at the phase's middle. */
  readonly labelAt: Point;
  /** How far its label turns to follow the ring: the tangent on the top half, half a turn more on the bottom half so it never reads upside down. */
  readonly labelTurnDeg: number;
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

/** The point `radius` from the face's centre at `angleDeg`. */
export function polarPoint(angleDeg: number, radius: number): Point {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: round(RING.centre + radius * Math.sin(radians)),
    y: round(RING.centre - radius * Math.cos(radians)),
  };
}

/** A clockwise arc along the ring. */
function arcPath(fromDeg: number, toDeg: number): string {
  const from = polarPoint(fromDeg, RING.radius);
  const to = polarPoint(toDeg, RING.radius);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${RING.radius} ${RING.radius} 0 ${large} 1 ${to.x} ${to.y}`;
}

/** Phase `index` of `count`, each an equal share of the face less a small gap either side. */
export function phaseArc(index: number, count: number): PhaseArc {
  assertInCycle(index, count);
  const share = 360 / count;
  const startDeg = share * index + RING.gapDeg / 2;
  const endDeg = share * (index + 1) - RING.gapDeg / 2;
  const midDeg = share * index + share / 2;
  const bottomHalf = midDeg > 90 && midDeg < 270;
  return {
    startDeg,
    endDeg,
    midDeg,
    path: arcPath(startDeg, endDeg),
    labelAt: polarPoint(midDeg, RING.radius),
    labelTurnDeg: bottomHalf ? midDeg - 180 : midDeg,
  };
}

/** The translation that moves phase `index` `distance` outward along its middle. */
export function popOffset(index: number, count: number, distance: number): Point {
  const { midDeg } = phaseArc(index, count);
  const tip = polarPoint(midDeg, distance);
  return { x: round(tip.x - RING.centre), y: round(tip.y - RING.centre) };
}

/** `count` evenly spaced ticks just outside the ring, the first at 12 o'clock. */
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
