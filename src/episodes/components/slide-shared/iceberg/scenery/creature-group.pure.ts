import type { Placement } from './scenery.pure';

export interface GroupProps {
  readonly x: number;
  readonly y: number;
  readonly at?: readonly Placement[];
  readonly count?: number;
  readonly seed?: number;
  readonly scale?: number;
  readonly flip?: boolean;
}

export function placeTransform(p: Placement, scale: number, flip = false): string {
  if (!(scale > 0)) throw new Error(`A creature group needs a positive group scale, got ${scale}.`);
  return `translate(${p.x} ${p.y}) scale(${(flip ? -1 : 1) * p.s * scale} ${p.s * scale})`;
}
