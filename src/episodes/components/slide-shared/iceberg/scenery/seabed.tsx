import { SEABED } from './facet-data';
import { Facets } from './facets';
import styles from './scenery.module.css';
import { rayWedges } from './scenery.pure';

/** The drawn seabed's width; `width` stretches it across. */
const SEABED_WIDTH = 1200;

export interface SeabedProps {
  /** Where the seabed's top runs, about; its ridge rises and falls a little around it. */
  readonly y: number;
  readonly x?: number;
  readonly width?: number;
}

/** The sandy floor of the Abyss, faceted, with a few rocks on it. Static. */
export function Seabed({ y, x = 0, width = SEABED_WIDTH }: SeabedProps) {
  return (
    <g className={styles.scenery} data-seabed transform={`translate(${x} ${y}) scale(${width / SEABED_WIDTH} 1)`}>
      <Facets layers={SEABED} />
    </g>
  );
}

export interface LightRaysProps {
  /** The first shaft's left edge, at the waterline. */
  readonly x: number;
  /** The waterline the shafts fall from. */
  readonly y: number;
  readonly count?: number;
  /** The distance between two shafts. */
  readonly spread?: number;
  readonly length?: number;
  readonly seed?: number;
}

/** Sun shafts slanting into the Sunlit water from the waterline: thin translucent wedges. Static. */
export function LightRays({ x, y, count = 5, spread = 70, length = 200, seed = 1 }: LightRaysProps) {
  return (
    <g className={styles.scenery} data-light-rays transform={`translate(${x} ${y})`}>
      {rayWedges({ count, spread, length, seed }).map((points) => (
        <polygon key={points} data-tone="ray" data-ray points={points} />
      ))}
    </g>
  );
}
