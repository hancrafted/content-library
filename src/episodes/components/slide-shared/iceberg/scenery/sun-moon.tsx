import { crescentFacets, sunFacets, toPoints } from './scenery.pure';
import styles from './sun-moon.module.css';

const GLOW_SIDES = 12;
const GLOW_REACH = 1.7;

const ring = (r: number) =>
  toPoints(
    Array.from({ length: GLOW_SIDES }, (_, k) => {
      const a = (k * 2 * Math.PI) / GLOW_SIDES;
      return [r * Math.cos(a), r * Math.sin(a)] as const;
    }),
  );

/**
 * Frozen interface (decisions 15–17 of feedback 2; pinned by `fable-elements.test.ts` and its slow sibling). A Fable
 * redraw changes only the drawing in `SunMoon` and `sun-moon.module.css`.
 *
 * - Props: `x`, `y`, `r` = 34, as typed here.
 * - Box: both lights and their glow stay within 1.7 × `r` of the centre.
 * - Hooks: root `data-sun-moon`; `data-sky-day` (the sun) and `data-sky-night` (the moon), both always drawn, the
 *   theme alone (`.dark`) showing one.
 * - Tokens it mixes from: `--bulb`, `--info`, `--on-brand-accent`, `--overlay`, with `transparent`.
 * - Motion: none.
 */
export interface SunMoonProps {
  /** The disc's centre in the Scene. */
  readonly x: number;
  readonly y: number;
  readonly r?: number;
}

/**
 * The Surface sky's light: a faceted sun in light mode and a crescent moon in dark. Both are drawn; the theme swaps
 * them in CSS alone (`.dark`), as the landing window does, so the static page needs no script to pick one.
 */
export function SunMoon({ x, y, r = 34 }: SunMoonProps) {
  return (
    <g className={styles.sunMoon} data-sun-moon transform={`translate(${x} ${y})`}>
      <g data-sky-day>
        <polygon data-tone="sun-glow" points={ring(r * GLOW_REACH)} />
        {sunFacets(r).map((facet) => (
          <polygon key={facet.points} data-tone={facet.lit ? 'sun-lit' : 'sun'} points={facet.points} />
        ))}
      </g>
      <g data-sky-night>
        <polygon data-tone="moon-glow" points={ring(r * GLOW_REACH * 0.8)} />
        {crescentFacets(r).map((facet) => (
          <polygon key={facet.points} data-tone={facet.lit ? 'moon-lit' : 'moon'} points={facet.points} />
        ))}
      </g>
    </g>
  );
}
