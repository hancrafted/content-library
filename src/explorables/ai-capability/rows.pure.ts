// decision: FE-012 §4.4
export const ROWS = ['effort', 'productivity', 'adoption', 'disciplines', 'oversight', 'explain'] as const;
export type Row = (typeof ROWS)[number];

/**
 * The toolbar's chips: Explain first, since the page opens with it, then the rows in stacking order. Its row still
 * stacks last, above the model band, so its wire never crosses another row.
 */
export const CHIP_ORDER: readonly Row[] = ['explain', ...ROWS.filter((row) => row !== 'explain')];

export const OPENING_ROWS: readonly Row[] = ['explain'];

export function gridRows(shown: readonly Row[]): number {
  return 2 + shown.length + (shown.includes('explain') ? 1 : 0);
}

export function gridLine(shown: readonly Row[], row: Row): number | null {
  const at = shown.indexOf(row);
  return at < 0 ? null : 3 + at;
}

export function toggleRow(shown: readonly Row[], row: Row): Row[] {
  const next = shown.includes(row) ? shown.filter((each) => each !== row) : [...shown, row];
  return ROWS.filter((each) => next.includes(each));
}

export const TRACK_END = 30;
export const TRACK_TICKS = [1, 20] as const;

export function trackPercent(multiplier: number): number {
  if (multiplier <= 1) return 0;
  return Math.min(100, (Math.log(multiplier) / Math.log(TRACK_END)) * 100);
}
