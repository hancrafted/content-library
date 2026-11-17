const CENTRE = { x: 32, y: 36 } as const;
const ARC_RADIUS = 24;
const NEEDLE_LENGTH = 18;

export interface DialGeometry {
  readonly arc: string;
  readonly needle: { readonly x: number; readonly y: number };
}

const round = (value: number) => Math.round(value * 10) / 10;

function pointAt(turn: number, radius: number) {
  const angle = Math.PI * (1 - turn);
  return { x: round(CENTRE.x + radius * Math.cos(angle)), y: round(CENTRE.y - radius * Math.sin(angle)) };
}

export function dialGeometry(value: number): DialGeometry {
  const turn = Math.min(1, Math.max(0, value));
  const end = pointAt(turn, ARC_RADIUS);
  return {
    arc: `M8 36A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${end.x} ${end.y}`,
    needle: pointAt(turn, NEEDLE_LENGTH),
  };
}
