import type { Part } from './context.types';

/* The pure half of the chip drag: which chip a pointer position crosses, from the box of the chip under it. */

/** The chip under the pointer, as the DOM reports it: its part name, its horizontal box and the pointer's x. */
export interface ChipHit {
  readonly x: number;
  readonly part: string | undefined;
  readonly left: number;
  readonly width: number;
}

/** The chip, other than the dragged one, the pointer is over once it is past that chip's middle on the way in. */
export function crossedChip(order: readonly Part[], dragged: Part, hit: ChipHit | null): Part | null {
  const target = order.find((part) => part === hit?.part);
  if (!hit || !target || target === dragged) return null;
  const forwards = order.indexOf(dragged) < order.indexOf(target);
  return forwards === hit.x > hit.left + hit.width / 2 ? target : null;
}
