/*
 * The `bubbles` transition's wave front (docs/features/slide-transitions.md): an irregular, faceted crest riding on
 * the rising water, taller and lower peaks on a long swell. Seeded, so the static HTML and every visit draw the same
 * crest; never `Math.random`.
 */

/** One crest vertex: x from the box's left, y from its top; the box's bottom (`y = height`) is the water below. */
export type CrestPoint = readonly [x: number, y: number];

export interface CrestOptions {
  /** Picks the crest; the same seed always draws the same one. */
  readonly seed: number;
  /** The box's width, in the drawing's units. */
  readonly width: number;
  /** The box's height: the tallest peak nearly reaches its top, every valley sits near its bottom. */
  readonly height: number;
  /** How many peaks, at least two, so a tall one and a low one can stand side by side. */
  readonly peaks: number;
}

/** Peak heights, as fractions of the box, from the lowest to the tallest; each peak takes one, shuffled. */
const LOWEST_PEAK = 0.3;
const TALLEST_PEAK = 0.97;
/** How far a valley dips below the box's bottom edge, as a fraction of the box: it never quite reaches the water. */
const VALLEY = [0.03, 0.14] as const;
/** How unevenly the peaks are spaced: each peak's width is the even share times a factor in this range. */
const SPACING = [0.65, 1.35] as const;

/** A seeded generator in [0, 1): mulberry32. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const between = (random: () => number, [low, high]: readonly [number, number]) => low + random() * (high - low);
const round = (value: number) => Math.round(value * 10) / 10;

/** Peak heights from the lowest to the tallest, evenly stepped, then shuffled so tall and low neighbour each other. */
function peakHeights(peaks: number, random: () => number): number[] {
  const ladder = Array.from(
    { length: peaks },
    (_, index) => LOWEST_PEAK + ((TALLEST_PEAK - LOWEST_PEAK) * index) / (peaks - 1),
  );
  for (let index = ladder.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [ladder[index], ladder[other]] = [ladder[other]!, ladder[index]!];
  }
  return ladder;
}

/** Where along a peak's span its facets break, before jitter: a low-poly swell of five facets a side. */
const FACETS = [0.12, 0.26, 0.4, 0.5, 0.62, 0.76, 0.9] as const;

/** A swell's rise at `t` in 0..1: a rounded bump, leaning by `lean` so one face is steeper, as wind pushes it. */
const swell = (t: number, lean: number) => Math.sin(Math.PI * t ** lean) ** 1.6;

/**
 * The crest's vertices, left to right from `x = 0` to `x = width`: per peak a valley and a rounded swell broken into
 * flat facets in the Iceberg style's low-poly manner, each peak its own height and lean.
 */
export function waveCrest({ seed, width, height, peaks }: CrestOptions): readonly CrestPoint[] {
  if (!Number.isInteger(peaks) || peaks < 2 || !(width > 0) || !(height > 0))
    throw new Error(
      `A wave crest needs at least two whole peaks in a box of positive size; got ${peaks} peaks in ${width}×${height}.`,
    );
  const random = seeded(seed);
  const heights = peakHeights(peaks, random);
  const shares = heights.map(() => between(random, SPACING));
  const total = shares.reduce((sum, share) => sum + share, 0);
  const valley = () => height * (1 - between(random, VALLEY));
  let from = valley();
  const points: CrestPoint[] = [[0, round(from)]];
  let left = 0;
  heights.forEach((peak, index) => {
    const span = (width * shares[index]!) / total;
    const right = index === peaks - 1 ? width : left + span;
    const to = valley();
    const lean = between(random, [0.75, 1.3]);
    const top = height * (1 - peak);
    FACETS.forEach((at) => {
      const t = at + between(random, [-0.03, 0.03]);
      const base = from + (to - from) * t;
      points.push([round(left + span * t), round(base - (base - top) * swell(t, lean))]);
    });
    points.push([round(right), round(to)]);
    from = to;
    left = right;
  });
  return points;
}

/** The crest as one closed SVG path: along the vertices, then down to the box's bottom and back. */
export function crestPath(points: readonly CrestPoint[], height: number): string {
  const first = points[0]!;
  const last = points.at(-1)!;
  const along = points.map(([x, y]) => `L${x} ${y}`).join('');
  return `M${first[0]} ${height}${along}L${last[0]} ${height}Z`;
}
