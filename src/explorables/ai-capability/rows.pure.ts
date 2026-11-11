/*
 * The rows the toolbar adds above the Explain row, the typed registry FE-012 §4.4 asks for: one list says which rows
 * exist and the order they stack in. The ceiling track's scale lives here too, so a view only places numbers.
 */

/** The rows the toolbar switches, in the order they stack from the Level header down; the model band is always on. */
export const ROWS = ['effort', 'productivity', 'adoption', 'disciplines', 'oversight', 'explain'] as const;
export type Row = (typeof ROWS)[number];

/**
 * The toolbar's chips: Explain first, since the page opens with it, then the rows in stacking order. Its row still
 * stacks last, above the model band, so its wire never crosses another row.
 */
export const CHIP_ORDER: readonly Row[] = ['explain', ...ROWS.filter((row) => row !== 'explain')];

/** The rows a timeline opens with: Explain, the scenes and their wires to the model. */
export const OPENING_ROWS: readonly Row[] = ['explain'];

/** The grid rows a column takes: its rail stop and card, one per added row, and Explain's scene and wire. */
export function gridRows(shown: readonly Row[]): number {
  return 2 + shown.length + (shown.includes('explain') ? 1 : 0);
}

/** The grid line a shown row sits on in a wide container: under the rail stops (1) and the cards (2); none if hidden. */
export function gridLine(shown: readonly Row[], row: Row): number | null {
  const at = shown.indexOf(row);
  return at < 0 ? null : 3 + at;
}

/** The shown rows after one toolbar chip is pressed: in if it was out, out if it was in, always in registry order. */
export function toggleRow(shown: readonly Row[], row: Row): Row[] {
  const next = shown.includes(row) ? shown.filter((each) => each !== row) : [...shown, row];
  return ROWS.filter((each) => next.includes(each));
}

/** The end of the ceiling track, past the 20× promise. */
export const TRACK_END = 30;
/** The marks printed under the track. */
export const TRACK_TICKS = [1, 20] as const;

/** Where a multiplier sits on the ceiling track, in percent: a log scale from 1× to the track's end, clamped to both. */
export function trackPercent(multiplier: number): number {
  if (multiplier <= 1) return 0;
  return Math.min(100, (Math.log(multiplier) / Math.log(TRACK_END)) * 100);
}
