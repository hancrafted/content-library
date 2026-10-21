import type { PlacedBlock } from './context.pure';

/* The loupe's geometry: which blocks it lists, the frame on the bar round them, where it and its tail sit. */

/** Blocks shown before and after the hovered one. */
export const AROUND = 3;
export const ROWS = 2 * AROUND + 1;
/** The room the tail keeps from the top and bottom of the zoom, in px. */
const TAIL_EDGE = 18;

/** The seven blocks around a point of the bar (three before, three after), and the one under it. */
export function loupeRows(blocks: readonly PlacedBlock[], at: number, windowTokens: number) {
  const t = at * windowTokens;
  let i = blocks.findIndex((b) => t >= b.start && t < b.start + b.tokens);
  if (i < 0) i = t < (blocks[0]?.start ?? 0) ? 0 : blocks.length - 1;
  const from = Math.max(0, Math.min(blocks.length - ROWS, i - AROUND));
  return { rows: blocks.slice(from, from + ROWS), cursor: blocks[i]?.key ?? '' };
}

/** The frame on the bar round exactly the blocks the zoom lists, as percents of the window. */
export function loupeFrame(rows: readonly PlacedBlock[], windowTokens: number) {
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) return null;
  const pct = (n: number) => (n / windowTokens) * 100;
  return { start: pct(first.start), size: pct(last.start + last.tokens - first.start) };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** The zoom's top on the bar, and the tail's height inside the zoom: the tail sits at the pointer's height. */
export function loupePlacement({ at, barHeight, height }: { at: number; barHeight: number; height: number }) {
  const y = clamp(at * barHeight - height / 2, 0, Math.max(0, barHeight - height));
  const tail = clamp(at * barHeight - y, TAIL_EDGE, Math.max(TAIL_EDGE, height - TAIL_EDGE));
  return { y, tail };
}
