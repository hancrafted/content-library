export interface ThemeColors {
  bg: string;
  fg: string;
  border: string;
}

/** Progress at which the rail starts to hand its inverted theme back to the site theme. */
const FLIP_START = 0.75;
/** Progress span over which the hand-back runs. */
const FLIP_SPAN = 0.22;

/** `color-mix` of two colour expressions in oklab, `share`% of `from` over `to`. */
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

export function computeActiveStep(p: number): number {
  if (p < 0.26) return 1;
  if (p < 0.51) return 2;
  if (p < 0.76) return 3;
  if (p < 0.97) return 4;
  return 5;
}
