import { Art } from '../../art/art';
import { artName } from '../../art/art.pure';
import { toPoints } from './scenery.pure';
import styles from './siphonophore.module.css';

export interface SiphonophoreProps {
  readonly x: number;
  readonly y: number;
  readonly segments?: number;
  readonly scale?: number;
}

const BELL_STEP = 14;
const FIRST_BELL = 22;
const TRAIL = 70;

const bellAt = (index: number) => ({ x: 6 * Math.sin(index * 0.7), y: FIRST_BELL + index * BELL_STEP });

interface Point {
  readonly x: number;
  readonly y: number;
}

function Bells({ bells }: { readonly bells: readonly Point[] }) {
  return bells.map(({ x, y }) => (
    <g key={y} data-siphonophore-bell transform={`translate(${x} ${y})`}>
      <polygon data-tone="siph-bell-lit" points="-7,0 -2,-7 0,0" />
      <polygon data-tone="siph-bell" points="0,0 -2,-7 3,-6 7,0" />
      <polygon data-tone="siph-bell" points="-7,0 0,0 7,0 0,7" />
    </g>
  ));
}

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

export function Siphonophore({ x, y, segments = 9, scale = 1 }: SiphonophoreProps) {
  if (!Number.isInteger(segments) || segments < 1)
    throw new Error(`A siphonophore needs a whole count of one or more bells, got ${segments}.`);
  const bells = Array.from({ length: segments }, (_, index) => bellAt(index));
  return (
    <g className={styles.siphonophore} data-siphonophore transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={styles.sway} data-motion="ambient">
        <Art name={artName('siphonophore', segments)}>
          <Trail last={bells.at(-1)!} />
          <polygon data-tone="siph-float" points="0,-12 5,-6 4,6 0,10 -4,6 -5,-6" />
          <polygon data-tone="glint" points="-3,-6 0,-10 -1,-3" />
          <Bells bells={bells} />
        </Art>
      </g>
    </g>
  );
}
