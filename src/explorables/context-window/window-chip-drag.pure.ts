import type { Part } from './context.types';

export interface ChipHit {
  readonly x: number;
  readonly part: string | undefined;
  readonly left: number;
  readonly width: number;
}

export function crossedChip(order: readonly Part[], dragged: Part, hit: ChipHit | null): Part | null {
  const target = order.find((part) => part === hit?.part);
  if (!hit || !target || target === dragged) return null;
  const forwards = order.indexOf(dragged) < order.indexOf(target);
  return forwards === hit.x > hit.left + hit.width / 2 ? target : null;
}
