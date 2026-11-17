import type { Rect } from './viewport.pure.ts';

export const GUTTER = 48;
/** Sub-pixel layout rounds; a pixel of overlap is noise. */
const TOLERANCE = 1;

export function navigationTaken(nav: Rect | null, contentLeft: number): number {
  if (nav === null) return 0;
  const right = nav.left + nav.width;
  return right <= contentLeft + TOLERANCE ? right : 0;
}

export const isBeside = (column: Rect, option: Rect): boolean => option.left >= column.left + column.width - TOLERANCE;

export function railWidth(column: Rect, options: readonly Rect[]): number {
  return Math.max(0, ...options.filter((option) => isBeside(column, option)).map((option) => option.width));
}
