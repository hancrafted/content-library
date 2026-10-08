export const PAPER_CAPACITY = 96;

export function advancePaperPile(papers: number, elapsedSeconds: number, draining: boolean): number {
  if (![papers, elapsedSeconds].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new RangeError('Paper count and elapsed time must be finite and non-negative.');
  }
  return Math.max(0, Math.min(PAPER_CAPACITY, papers + elapsedSeconds * (draining ? -80 : 10)));
}
