// spec: docs/features/slide-transitions.md#named-transition-interface
export interface Bubble {
  readonly x: number;
  readonly size: number;
  readonly start: number;
  readonly rise: number;
  readonly phase: number;
}

const GOLDEN = 0.618_033_988_75;
const SIZES = [12, 28, 16, 40, 10, 22, 34, 14, 18, 44, 24] as const;
const EXIT = 1.2;

const round = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;
const roundUp = (value: number, places: number) => Math.ceil(value * 10 ** places) / 10 ** places;

const fraction = (value: number) => value - Math.floor(value);

export function bubbleField(count: number): readonly Bubble[] {
  if (!Number.isInteger(count) || count < 1)
    throw new Error(`A bubble field needs a whole number of bubbles, at least one; got ${count}.`);
  return Array.from({ length: count }, (_, index) => {
    const start = round(fraction(index * GOLDEN * 3) * 0.5, 3);
    const speed = 1 + fraction(index * GOLDEN * 7) * 0.5;
    return {
      x: round(2 + fraction(index * GOLDEN) * 96, 1),
      size: SIZES[index % SIZES.length]!,
      start,
      rise: roundUp((EXIT / (1 - start)) * speed, 3),
      phase: round(fraction(index * GOLDEN * 5) * 2 * Math.PI, 2),
    };
  });
}
