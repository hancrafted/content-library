import { CLOUDS } from './facet-data';
import { Facets } from './facets';
import styles from './scenery.module.css';
import { crescentFacets, sunFacets, toPoints } from './scenery.pure';

/** One cloud: its base centre in the Scene, its size against the drawn shape, and which of the two shapes. */
export interface CloudAt {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly shape: 0 | 1;
}

/** The Spec's sky over a 1200-wide Surface with the waterline at 400. */
const SPEC_CLOUDS: readonly CloudAt[] = [
  { x: 1040, y: 110, scale: 1, shape: 0 },
  { x: 880, y: 300, scale: 0.8, shape: 1 },
  { x: 150, y: 352, scale: 0.95, shape: 0 },
];

const WIND_SECONDS = 46;
const WIND_STAGGER_SECONDS = 16;

/** Faceted cumulus clouds, lit crowns to the upper left; the Surface zone's wind drifts each one slowly. */
export function Clouds({ at = SPEC_CLOUDS }: { readonly at?: readonly CloudAt[] }) {
  return (
    <g className={styles.scenery} data-clouds>
      {at.map((cloud, index) => (
        <g key={`${cloud.x}:${cloud.y}`} transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.scale})`}>
          <g
            className={styles.wind}
            data-cloud
            data-motion="ambient"
            style={{ animationDuration: `${WIND_SECONDS + index * WIND_STAGGER_SECONDS}s` }}
          >
            <Facets layers={CLOUDS[cloud.shape]} />
          </g>
        </g>
      ))}
    </g>
  );
}

const GLOW_SIDES = 12;
const GLOW_REACH = 1.7;

const ring = (r: number) =>
  toPoints(
    Array.from({ length: GLOW_SIDES }, (_, k) => {
      const a = (k * 2 * Math.PI) / GLOW_SIDES;
      return [r * Math.cos(a), r * Math.sin(a)] as const;
    }),
  );

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
    <g className={styles.scenery} data-sun-moon transform={`translate(${x} ${y})`}>
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
