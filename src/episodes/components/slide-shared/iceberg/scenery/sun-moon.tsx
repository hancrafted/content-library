import { Art } from '../../art/art';
import { artName } from '../../art/art.pure';
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
  readonly x: number;
  readonly y: number;
  readonly r?: number;
}

export function SunMoon({ x, y, r = 34 }: SunMoonProps) {
  return (
    <g className={styles.sunMoon} data-sun-moon transform={`translate(${x} ${y})`}>
      <g data-sky-day>
        <Art name={artName('sun', r)}>
          <polygon data-tone="sun-glow" points={ring(r * GLOW_REACH)} />
          {sunFacets(r).map((facet) => (
            <polygon key={facet.points} data-tone={facet.lit ? 'sun-lit' : 'sun'} points={facet.points} />
          ))}
        </Art>
      </g>
      <g data-sky-night>
        <Art name={artName('moon', r)}>
          <polygon data-tone="moon-glow" points={ring(r * GLOW_REACH * 0.8)} />
          {crescentFacets(r).map((facet) => (
            <polygon key={facet.points} data-tone={facet.lit ? 'moon-lit' : 'moon'} points={facet.points} />
          ))}
        </Art>
      </g>
    </g>
  );
}
