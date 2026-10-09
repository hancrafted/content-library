export const PAPER_CAPACITY = 96;
export const PAPER_PILE_ORIGIN = { x: 975, y: 546, step: 7 };
export type PaperDrain = 'none' | 'primary' | 'secondary';
const RATES = { none: 10, primary: -80 / 3, secondary: -80 };

export function advancePaperPile(papers: number, elapsedSeconds: number, draining: PaperDrain): number {
  if (![papers, elapsedSeconds].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new RangeError('Paper count and elapsed time must be finite and non-negative.');
  }
  return Math.max(0, Math.min(PAPER_CAPACITY, papers + elapsedSeconds * RATES[draining]));
}
