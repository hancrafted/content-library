import type { PlacedBlock } from './context.pure';

export interface Around {
  readonly before: number;
  readonly after: number;
}
export const AROUND: Around = { before: 2, after: 2 };
const TAIL_EDGE = 18;

function blockAt(blocks: readonly PlacedBlock[], t: number) {
  const i = blocks.findIndex((b) => t >= b.start && t < b.start + b.tokens);
  if (i >= 0) return i;
  return t < (blocks[0]?.start ?? 0) ? 0 : blocks.length - 1;
}

export interface BarPoint {
  readonly at: number;
  readonly windowTokens: number;
}

export function loupeRows(blocks: readonly PlacedBlock[], point: BarPoint, around: Around = AROUND) {
  const i = blockAt(blocks, point.at * point.windowTokens);
  const rows = blocks.slice(Math.max(0, i - around.before), i + around.after + 1);
  return { rows, cursor: blocks[i]?.key ?? '' };
}

export const MIN_BLOCK = 2;

export function loupeFrame(rows: readonly PlacedBlock[], windowTokens: number, barHeight: number) {
  if (!rows.length) return null;
  const px = (n: number) => (n / windowTokens) * barHeight;
  const top = Math.min(...rows.map((b) => px(b.start)));
  const bottom = Math.max(...rows.map((b) => px(b.start) + Math.max(px(b.tokens), MIN_BLOCK)));
  return { top, height: bottom - top };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function loupePlacement({ at, barHeight, height }: { at: number; barHeight: number; height: number }) {
  const y = clamp(at * barHeight - height / 2, 0, Math.max(0, barHeight - height));
  const tail = clamp(at * barHeight - y, TAIL_EDGE, Math.max(TAIL_EDGE, height - TAIL_EDGE));
  return { y, tail };
}
