/* The 0/1 trickle from the AI's bubble into the bar: where each digit starts and when it falls. Pure. */

export interface TrickleDigit {
  readonly char: '0' | '1';
  /** Horizontal start, a percentage of the lane's width, right of the bar caption. */
  readonly x: number;
  /** Sideways drift while falling, in rem. */
  readonly drift: number;
  /** Delay before the digit starts, in ms. */
  readonly delay: number;
}

/** A fixed, scattered-looking sequence: the same digits on every build, so the static HTML never differs. */
const START = [4, 11, 7, 16, 2, 13, 9, 19, 5, 15, 8, 18, 3, 12, 6, 17, 10, 14];

/** The digits for a bar `count` deep: the first `count` of a fixed sequence, alternating 1 and 0 with a stutter. */
export function trickleDigits(count: number): readonly TrickleDigit[] {
  const n = Math.max(0, Math.min(count, START.length));
  return Array.from({ length: n }, (_, i) => ({
    char: (i * 7 + (i >> 1)) % 3 === 0 ? '0' : '1',
    x: 35 + (START[i] ?? 0) * 3,
    drift: (i * 5) % 4,
    delay: 250 + i * 70,
  }));
}
