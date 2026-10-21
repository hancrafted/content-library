import type { PlacedBlock } from './context.pure';

/* The loupe's geometry: which blocks it lists, the frame on the bar round them, where it and its tail sit. */

/** How many blocks the zoom shows before and after the hovered one. */
export interface Around {
  readonly before: number;
  readonly after: number;
}
export const AROUND: Around = { before: 2, after: 2 };
/** The room the tail keeps from the top and bottom of the zoom, in px. */
const TAIL_EDGE = 18;

/** The index of the block under a point of the bar, the nearest end when the point is off the blocks. */
function blockAt(blocks: readonly PlacedBlock[], t: number) {
  const i = blocks.findIndex((b) => t >= b.start && t < b.start + b.tokens);
  if (i >= 0) return i;
  return t < (blocks[0]?.start ?? 0) ? 0 : blocks.length - 1;
}

/** A point of the bar: 0 to 1 down it, in a window of this many tokens. */
export interface BarPoint {
  readonly at: number;
  readonly windowTokens: number;
}

/** The blocks around a point of the bar (`before` and `after` of them, clamped at the ends), and the one under it. */
export function loupeRows(blocks: readonly PlacedBlock[], point: BarPoint, around: Around = AROUND) {
  const i = blockAt(blocks, point.at * point.windowTokens);
  const rows = blocks.slice(Math.max(0, i - around.before), i + around.after + 1);
  return { rows, cursor: blocks[i]?.key ?? '' };
}

/** The least height a block has on the bar, in px (`.block` in context.module.css). */
export const MIN_BLOCK = 2;

/** The frame on the bar round exactly the blocks the zoom lists: the union of their boxes, in px down the bar. */
export function loupeFrame(rows: readonly PlacedBlock[], windowTokens: number, barHeight: number) {
  if (!rows.length) return null;
  const px = (n: number) => (n / windowTokens) * barHeight;
  const top = Math.min(...rows.map((b) => px(b.start)));
  const bottom = Math.max(...rows.map((b) => px(b.start) + Math.max(px(b.tokens), MIN_BLOCK)));
  return { top, height: bottom - top };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** The zoom's top on the bar, and the tail's height inside the zoom: the tail sits at the pointer's height. */
export function loupePlacement({ at, barHeight, height }: { at: number; barHeight: number; height: number }) {
  const y = clamp(at * barHeight - height / 2, 0, Math.max(0, barHeight - height));
  const tail = clamp(at * barHeight - y, TAIL_EDGE, Math.max(TAIL_EDGE, height - TAIL_EDGE));
  return { y, tail };
}
