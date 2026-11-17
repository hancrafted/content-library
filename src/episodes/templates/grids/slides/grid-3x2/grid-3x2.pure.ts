export const GRID_3X2_CELLS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;

export type Grid3x2Cell = (typeof GRID_3X2_CELLS)[number];

export interface PointerPoint {
  x: number;
  y: number;
}

export interface CardBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function spotlightPoint(pointer: PointerPoint, box: CardBox): PointerPoint {
  if (!Number.isFinite(pointer.x) || !Number.isFinite(pointer.y)) {
    throw new Error(`"${pointer.x}, ${pointer.y}" is not a pointer position.`);
  }
  const clamp = (value: number, size: number) => Math.min(Math.max(value, 0), Math.max(size, 0));
  return { x: clamp(pointer.x - box.left, box.width), y: clamp(pointer.y - box.top, box.height) };
}

export function cellNumber(index: number): string {
  if (!Number.isInteger(index) || index < 0) throw new Error(`"${index}" is not a cell index.`);
  return String(index + 1).padStart(2, '0');
}
