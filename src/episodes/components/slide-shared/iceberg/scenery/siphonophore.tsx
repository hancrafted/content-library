import { toPoints } from './scenery.pure';
import styles from './siphonophore.module.css';

/**
 * Frozen interface (decisions 15–17 of feedback 2; pinned by `fable-elements.test.ts` and its slow sibling). A Fable
 * redraw changes only the drawing below and `siphonophore.module.css`.
 *
 * - Props: `x`, `y` (the float's top), `segments` = 9 (the swimming bells), `scale` = 1, as typed here.
 * - Box: at scale 1 with 9 segments the colony stays within x -20 to 20, y -12 to 220 below its float.
 * - Hooks: root `data-siphonophore`; each bell `data-siphonophore-bell`.
 * - Tokens it mixes from: `--info`, `--on-brand-accent`, `--overlay`, with `transparent`.
 * - Motion: the moving parts are `data-motion="ambient"`, swaying from the float, under `[data-zone='active']` only
 *   and never under reduced motion; transform and opacity only (decision 19).
 */
export interface SiphonophoreProps {
  /** The top of the float, in the Scene. */
  readonly x: number;
  readonly y: number;
  /** How many swimming bells hang under the float. */
  readonly segments?: number;
  readonly scale?: number;
}

const BELL_STEP = 14;
const FIRST_BELL = 22;
const TRAIL = 70;

/** Where bell `index` hangs: down the stem, swinging gently left and right. */
const bellAt = (index: number) => ({ x: 6 * Math.sin(index * 0.7), y: FIRST_BELL + index * BELL_STEP });

interface Point {
  readonly x: number;
  readonly y: number;
}

/** The swimming bells down the stem, each lit on its upper left. */
function Bells({ bells }: { readonly bells: readonly Point[] }) {
  return bells.map(({ x, y }) => (
    <g key={y} data-siphonophore-bell transform={`translate(${x} ${y})`}>
      <polygon data-tone="siph-bell-lit" points="-7,0 -2,-7 0,0" />
      <polygon data-tone="siph-bell" points="0,0 -2,-7 3,-6 7,0" />
      <polygon data-tone="siph-bell" points="-7,0 0,0 7,0 0,7" />
    </g>
  ));
}

/** The stem from the float past the last bell, and two tentacles trailing from its end. */
function Trail({ last }: { readonly last: Point }) {
  const end = last.y + TRAIL;
  const stem = toPoints([
    [-0.8, 8],
    [0.8, 8],
    [last.x + 0.8, end],
    [last.x - 0.8, end],
  ]);
  return (
    <>
      <polygon data-tone="siph-stem" points={stem} />
      {[-1, 1].map((side) => (
        <polygon
          key={side}
          data-tone="siph-stem"
          points={toPoints([
            [last.x, last.y + 10],
            [last.x + side * 14, end - 10],
            [last.x + side * 13, end - 8],
          ])}
        />
      ))}
    </>
  );
}

/**
 * A siphonophore, the Twilight Section titles' long colony (decision 11 of feedback 2): a small float, a string of
 * translucent swimming bells and a trailing stem, swaying slowly from the float. A placeholder for the Fable redraw.
 */
export function Siphonophore({ x, y, segments = 9, scale = 1 }: SiphonophoreProps) {
  if (!Number.isInteger(segments) || segments < 1)
    throw new Error(`A siphonophore needs a whole count of one or more bells, got ${segments}.`);
  const bells = Array.from({ length: segments }, (_, index) => bellAt(index));
  return (
    <g className={styles.siphonophore} data-siphonophore transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={styles.sway} data-motion="ambient">
        <Trail last={bells.at(-1)!} />
        <polygon data-tone="siph-float" points="0,-12 5,-6 4,6 0,10 -4,6 -5,-6" />
        <polygon data-tone="glint" points="-3,-6 0,-10 -1,-3" />
        <Bells bells={bells} />
      </g>
    </g>
  );
}
