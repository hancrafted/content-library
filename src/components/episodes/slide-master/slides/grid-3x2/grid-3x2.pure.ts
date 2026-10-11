/** The six cells of the Grid 3 × 2 Slide, in reading order: row 1 left to right, then rows 2 and 3. */
export const GRID_3X2_CELLS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;

export type Grid3x2Cell = (typeof GRID_3X2_CELLS)[number];

/** A pointer position in viewport pixels, as a pointer event reports it. */
export interface PointerPoint {
  x: number;
  y: number;
}

/** The card's box in viewport pixels, as `getBoundingClientRect()` reports it. */
export interface CardBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where the spotlight centre sits inside a card, in pixels from its top-left corner.
 * The point is clamped to the card so a pointer leaving fast never parks the light outside the border.
 */
export function spotlightPoint(pointer: PointerPoint, box: CardBox): PointerPoint {
  if (!Number.isFinite(pointer.x) || !Number.isFinite(pointer.y)) {
    throw new Error(`"${pointer.x}, ${pointer.y}" is not a pointer position.`);
  }
  const clamp = (value: number, size: number) => Math.min(Math.max(value, 0), Math.max(size, 0));
  return { x: clamp(pointer.x - box.left, box.width), y: clamp(pointer.y - box.top, box.height) };
}

/** The decorative two-digit index shown on the cell at `index` (0-based, reading order). */
export function cellNumber(index: number): string {
  if (!Number.isInteger(index) || index < 0) throw new Error(`"${index}" is not a cell index.`);
  return String(index + 1).padStart(2, '0');
}
