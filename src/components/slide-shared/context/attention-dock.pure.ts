/*
 * The Attention list's compressed layout: each row is as tall as its share of the attention, and the pointer
 * magnifies the rows near it like the Mac dock, while the list's total height stays fixed.
 */

/** A row never gets thinner than this, in px: the bar must stay visible even when the text cannot be read. */
export const MIN_ROW = 4;
/** Rows either side of the pointer that the magnification reaches. */
export const REACH = 3;

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** Row heights that follow the units and fill `total`; a row under `min` takes `min` and the others give it up. */
export function restHeights(units: readonly number[], total: number, min = MIN_ROW): number[] {
  const heights = units.map(() => 0);
  let free = units.map((_, i) => i);
  let room = total;
  for (let pass = 0; pass <= units.length; pass++) {
    const share = sum(free.map((i) => units[i] ?? 0));
    const small = free.filter((i) => (share > 0 ? ((units[i] ?? 0) / share) * room : room / free.length) < min);
    if (small.length === 0) break;
    small.forEach((i) => {
      heights[i] = min;
      room -= min;
    });
    free = free.filter((i) => !small.includes(i));
  }
  const share = sum(free.map((i) => units[i] ?? 0));
  free.forEach((i) => {
    heights[i] = share > 0 ? ((units[i] ?? 0) / share) * room : room / free.length;
  });
  return heights;
}

/** The magnification of a row at a distance in rows from the pointer: 1 under it, 0 from `REACH` away. */
export function falloff(distance: number): number {
  const d = Math.abs(distance);
  return d >= REACH ? 0 : (1 + Math.cos((d / REACH) * Math.PI)) / 2;
}

/** The continuous row index under a pointer `y` px down the resting layout: row 1 halfway down is 1.5. */
export function pointerIndex(rest: readonly number[], y: number): number {
  let top = 0;
  for (let i = 0; i < rest.length; i++) {
    const height = rest[i] ?? 0;
    if (y < top + height) return i + (height > 0 ? (y - top) / height : 0);
    top += height;
  }
  return Math.max(0, rest.length - 1);
}

/**
 * The heights while the pointer is at row index `at` (null: away): rows near it grow towards `full`, and the rest
 * shrink, most where they are least magnified, so the sum is unchanged. Never under `min`.
 */
export function dockHeights(rest: readonly number[], at: number | null, full: number): number[] {
  if (at === null || rest.length === 0) return [...rest];
  const weights = rest.map((_, i) => falloff(i - at));
  const grown = rest.map((h, i) => h + (Math.max(h, full) - h) * (weights[i] ?? 0));
  const extra = sum(grown) - sum(rest);
  const give = grown.map((h, i) => Math.max(0, h - MIN_ROW) * (1 - (weights[i] ?? 0)));
  const room = sum(give);
  if (room <= 0) return [...rest];
  const scale = Math.min(1, extra / room);
  return grown.map((h, i) => h - (give[i] ?? 0) * scale);
}

/** Where the continuous row index `at` sits, in px down the layout `heights`. */
function positionOf(heights: readonly number[], at: number): number {
  const row = Math.min(Math.floor(at), heights.length - 1);
  const above = sum(heights.slice(0, Math.max(0, row)));
  return above + (at - row) * (heights[row] ?? 0);
}

const SEARCH_STEPS = 14;

/**
 * The row index to magnify so the magnified row sits under the pointer at `y`. The magnified rows push each other
 * down, so the row under the pointer at rest is not the one under it once docked; bisecting on the docked layout
 * finds the index whose docked position is `y`, which keeps the lit row and the peak the same row.
 */
export function anchorIndex(rest: readonly number[], y: number, full: number): number {
  let low = 0;
  let high = Math.max(0, rest.length - 1);
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const mid = (low + high) / 2;
    if (positionOf(dockHeights(rest, mid, full), mid) < y) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
