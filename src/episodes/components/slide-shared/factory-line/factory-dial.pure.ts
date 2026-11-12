/** The dial face: a half circle round (32, 36) on a 64 by 42 view box, the arc at radius 24, the needle 18 long. */
const CENTRE = { x: 32, y: 36 } as const;
const ARC_RADIUS = 24;
const NEEDLE_LENGTH = 18;

/** Where a dial's arc ends and its needle points, the arc as an SVG path from the left end. */
export interface DialGeometry {
  readonly arc: string;
  readonly needle: { readonly x: number; readonly y: number };
}

const round = (value: number) => Math.round(value * 10) / 10;

/** A point on the dial at `radius`, turned from the left end (0) over the top to the right end (1). */
function pointAt(turn: number, radius: number) {
  const angle = Math.PI * (1 - turn);
  return { x: round(CENTRE.x + radius * Math.cos(angle)), y: round(CENTRE.y - radius * Math.sin(angle)) };
}

/** The arc and needle of a dial set to `value`, clamped to the dial's range 0 to 1. */
export function dialGeometry(value: number): DialGeometry {
  const turn = Math.min(1, Math.max(0, value));
  const end = pointAt(turn, ARC_RADIUS);
  return {
    arc: `M8 36A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${end.x} ${end.y}`,
    needle: pointAt(turn, NEEDLE_LENGTH),
  };
}
