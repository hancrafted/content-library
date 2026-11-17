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

const REACH_TOLERANCE = 1e-6;

export function isStepReached(p: number, idx: number, count: number): boolean {
  return p >= stepPosition(idx, count) - REACH_TOLERANCE;
}
