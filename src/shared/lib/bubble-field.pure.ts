/*
 * The `bubbles` transition's air bubbles (docs/features/slide-transitions.md): round, separate bubbles that rise
 * through the outgoing Slide's trailing edge as the edge's progress runs from 0 to 1. Deterministic, so the static
 * HTML and every visit draw the same field; the page's clock moves it through `--surface-edge-progress`, never a frame.
 */

/** One bubble: where it rises, how big it is, when it enters and how fast it climbs. */
export interface Bubble {
  /** Its left edge, in percent of the host's width. */
  readonly x: number;
  /** Its diameter in CSS pixels. */
  readonly size: number;
  /** The edge progress at which it enters at the host's bottom. */
  readonly start: number;
  /** Host heights it climbs per unit of progress; it has left through the top by full progress. */
  readonly rise: number;
  /** Its sway's phase, in radians, so neighbours never sway in step. */
  readonly phase: number;
}

const GOLDEN = 0.618_033_988_75;
const SIZES = [12, 28, 16, 40, 10, 22, 34, 14, 18, 44, 24] as const;
/** The host heights a bubble still has to climb at full progress, so even the largest has left through the top. */
const EXIT = 1.2;

/** The fractional part: a low-discrepancy step, so bubbles spread across the width without clumping. */
const fraction = (value: number) => value - Math.floor(value);

/** `count` bubbles, spread across the width, entering one after another through the first half of the edge. */
export function bubbleField(count: number): readonly Bubble[] {
  if (!Number.isInteger(count) || count < 1)
    throw new Error(`A bubble field needs a whole number of bubbles, at least one; got ${count}.`);
  return Array.from({ length: count }, (_, index) => {
    const start = fraction(index * GOLDEN * 3) * 0.5;
    const speed = 1 + fraction(index * GOLDEN * 7) * 0.5;
    return {
      x: 2 + fraction(index * GOLDEN) * 96,
      size: SIZES[index % SIZES.length]!,
      start,
      rise: (EXIT / (1 - start)) * speed,
      phase: fraction(index * GOLDEN * 5) * 2 * Math.PI,
    };
  });
}
