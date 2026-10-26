export const PAPER_CAPACITY = 96;
export const PAPER_PILE_ORIGIN = { x: 975, y: 546, step: 7 };
export type PaperDrain = 'none' | 'primary';
const RATES = { none: 10, primary: -80 / 3 };
// Right beside the button the pile drains gently, so the reader sees it react before reaching it.
const NEAR_RATE = -10;

/**
 * What pulls on the pile: the promise button drains it at full speed; otherwise a number is the
 * pointer's proximity to that button (0 far, 1 over it), blending growth into a gentle drain.
 */
export type PilePull = PaperDrain | number;

function pullRate(pull: PilePull) {
  if (typeof pull === 'string') return RATES[pull];
  if (!(pull >= 0 && pull <= 1)) throw new RangeError('Proximity must be between 0 and 1.');
  return RATES.none + (NEAR_RATE - RATES.none) * pull;
}

export function advancePaperPile(papers: number, elapsedSeconds: number, pull: PilePull): number {
  if (![papers, elapsedSeconds].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new RangeError('Paper count and elapsed time must be finite and non-negative.');
  }
  return Math.max(0, Math.min(PAPER_CAPACITY, papers + elapsedSeconds * pullRate(pull)));
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The tray's shadow in tray coordinates. The window light sits behind and to the right,
 * so the shadow falls forward: its right edge drops almost straight down and its left
 * edge fans out to the left. It lengthens as the pile grows.
 */
export function pileShadowPath(papers: number): string {
  if (!Number.isFinite(papers) || papers < 0) {
    throw new RangeError('Paper count must be finite and non-negative.');
  }
  const length = 30 + Math.min(papers, PAPER_CAPACITY) * 2.2;
  const right = round(392 + length * 0.08);
  const left = round(-12 - length * 1.2);
  return `M-12 16H300L392 145L${right} ${round(145 + length)}H${left}Z`;
}
