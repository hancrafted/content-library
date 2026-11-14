/*
 * How a group of sea creatures is placed: its centre, its members explicitly or scattered by count and seed, and
 * each member's transform. Shared by every creature group (fish, jellies, lanternfish, bubbles), so their frozen
 * interfaces take the same props.
 */
import type { Placement } from './scenery.pure';

/** What a group of sea creatures takes: its centre, and its members explicitly or scattered by count and seed. */
export interface GroupProps {
  /** The group's centre in the Scene. */
  readonly x: number;
  readonly y: number;
  /** Explicit members, relative to the centre; when given, `count` and `seed` are ignored. */
  readonly at?: readonly Placement[];
  readonly count?: number;
  /** Picks the scatter; the same seed always draws the same group. */
  readonly seed?: number;
  readonly scale?: number;
  /** Faces the group left instead of right. */
  readonly flip?: boolean;
}

/**
 * One member's place in its group as an SVG `transform`, mirrored when the group faces left. Refuses a group scale of
 * zero or less: `flip` is the one way a group mirrors.
 */
export function placeTransform(p: Placement, scale: number, flip = false): string {
  if (!(scale > 0)) throw new Error(`A creature group needs a positive group scale, got ${scale}.`);
  return `translate(${p.x} ${p.y}) scale(${(flip ? -1 : 1) * p.s * scale} ${p.s * scale})`;
}
