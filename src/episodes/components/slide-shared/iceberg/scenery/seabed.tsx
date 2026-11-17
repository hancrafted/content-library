import { Art } from '../../art/art';
import { artName } from '../../art/art.pure';
import { SEABED } from './facet-data';
import { Facets } from './facets';
import styles from './scenery.module.css';
import { rayWedges } from './scenery.pure';

const SEABED_WIDTH = 1200;

export interface SeabedProps {
  readonly y: number;
  readonly x?: number;
  readonly width?: number;
}

export function Seabed({ y, x = 0, width = SEABED_WIDTH }: SeabedProps) {
  return (
    <g className={styles.scenery} data-seabed transform={`translate(${x} ${y}) scale(${width / SEABED_WIDTH} 1)`}>
      <Art name="seabed">
        <Facets layers={SEABED} />
      </Art>
    </g>
  );
}

export interface LightRaysProps {
  readonly x: number;
  readonly y: number;
  readonly count?: number;
  readonly spread?: number;
  readonly length?: number;
  readonly seed?: number;
}

export function LightRays({ x, y, count = 5, spread = 70, length = 200, seed = 1 }: LightRaysProps) {
  return (
    <g className={styles.scenery} data-light-rays transform={`translate(${x} ${y})`}>
      <Art name={artName('rays', { count, spread, length, seed })}>
        {rayWedges({ count, spread, length, seed }).map((points) => (
          <polygon key={points} data-tone="ray" data-ray points={points} />
        ))}
      </Art>
    </g>
  );
}
