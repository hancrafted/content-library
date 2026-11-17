export interface ThemeColors {
  bg: string;
  fg: string;
  border: string;
}

const FLIP_START = 0.75;
const FLIP_SPAN = 0.22;

function mix(from: string, share: number, to: string): string {
  return `color-mix(in oklab, ${from} ${(share * 100).toFixed(1)}%, ${to})`;
}

/**
 * The method rail's colours at scroll progress `p`: it opens in the inverse of the site theme (dark on a light
 * site, light on a dark one) and hands back to the site theme as the rail ends. Every colour is a mix of the global
 * tokens (`--background`, `--foreground`, `--border`), so the same maths serves both themes and the browser resolves
 * the values; a pure function cannot read the computed style, and does not need to.
 */
export function computeThemeColors(p: number): ThemeColors {
  const t = Math.min(1, Math.max(0, (p - FLIP_START) / FLIP_SPAN));
  const invertedBorder = 'color-mix(in oklab, var(--background) 12%, transparent)';
  return {
    bg: mix('var(--background)', t, 'var(--foreground)'),
    fg: mix('var(--foreground)', t, 'var(--background)'),
    border: mix('var(--border)', t, invertedBorder),
  };
}

export function stepPosition(idx: number, count: number): number {
  return count > 1 ? idx / (count - 1) : 0;
}

export function computeActiveStep(p: number, count: number): number {
  const clamped = Math.min(1, Math.max(0, p));
  return Math.round(clamped * (count - 1)) + 1;
}

/** Float slack, so the bar sitting exactly on a node (progress 0.75 against 3/4) counts as reaching it. */
const REACH_TOLERANCE = 1e-6;

export function isStepReached(p: number, idx: number, count: number): boolean {
  return p >= stepPosition(idx, count) - REACH_TOLERANCE;
}
