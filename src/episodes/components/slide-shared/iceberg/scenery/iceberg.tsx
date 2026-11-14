import { ICEBERG_GLOW, ICEBERG_KEEL, ICEBERG_TIP } from './facet-data';
import { Facets } from './facets';
import styles from './scenery.module.css';
import { icebergLayers, type IcebergPart } from './scenery.pure';

export interface IcebergProps {
  /** `whole` on the Surface, `tip` where only the visible part matters, `keel` once the Scene is below the waterline. */
  readonly part?: IcebergPart;
  /** The centre of the iceberg, across. */
  readonly x: number;
  /** Where the waterline crosses the Scene; the tip stands on it and the keel hangs from it. */
  readonly waterline: number;
  readonly scale?: number;
  /**
   * Stretches the keel downward only, so its point lands where the Scene needs it (about 250 m, the top of the
   * Twilight zone): `depthScaleForKeel(waterline, keelY)` gives the value.
   */
  readonly depthScale?: number;
}

/**
 * The iceberg, the frame of the Iceberg style: a jagged, triangular low-poly berg, white-lit facets above the
 * waterline and white to deep blue below, its keel stepping in to one point. It never moves; `ZoneScene` shows the
 * part its zone needs. An SVG group for a Scene's own `<svg>`.
 */
export function Iceberg({ part = 'whole', x, waterline, scale = 1, depthScale = 1 }: IcebergProps) {
  const layers = icebergLayers(part);
  return (
    <g className={styles.scenery} data-iceberg={part} transform={`translate(${x} ${waterline}) scale(${scale})`}>
      {layers.keel && (
        <g data-iceberg-keel transform={`scale(1 ${depthScale})`}>
          <Facets layers={ICEBERG_KEEL} />
        </g>
      )}
      {layers.tip && (
        <g data-iceberg-tip>
          <Facets layers={ICEBERG_TIP} />
        </g>
      )}
      {layers.glow && (
        <g data-iceberg-glow>
          <Facets layers={ICEBERG_GLOW} />
        </g>
      )}
    </g>
  );
}
