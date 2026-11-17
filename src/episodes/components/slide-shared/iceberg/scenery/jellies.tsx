import { Art } from '../../art/art';
import { placeTransform, type GroupProps } from './creature-group.pure';
import type { FacetLayer } from './facet-data';
import { Facets } from './facets';
import styles from './jellies.module.css';
import { scatter, type Placement } from './scenery.pure';

const JELLY_BLOOM: readonly Placement[] = [
  { x: 0, y: 0, s: 1.4 },
  { x: 50, y: 40, s: 1 },
];

const JELLY_STAGGER_SECONDS = 3;

export function Jellies({ x, y, at, count, seed = 1, scale = 1 }: Omit<GroupProps, 'flip'>) {
  const jellies = at ?? (count === undefined ? JELLY_BLOOM : scatter({ count, seed, spread: [80, 50], gap: [26, 30] }));
  return (
    <g className={styles.jellies} data-jellies transform={`translate(${x} ${y})`}>
      {jellies.map((p, index) => (
        <g key={`${p.x}:${p.y}`} transform={placeTransform(p, scale)}>
          <g
            className={styles.bob}
            data-jelly
            data-motion="ambient"
            style={{ animationDelay: `${-index * JELLY_STAGGER_SECONDS}s` }}
          >
            <Art name="jelly">
              <Facets layers={JELLY} />
            </Art>
          </g>
        </g>
      ))}
    </g>
  );
}

const JELLY: readonly FacetLayer[] = [
  { tone: 'jelly', d: 'M-10 0L-7 -8L0 -11L7 -8L10 0Z' },
  { tone: 'jelly-lit', d: 'M-7 -8L0 -11L0 0L-10 0Z' },
  { tone: 'jelly', d: 'M-6 0L-4 0L-5 14ZM-1 0L1 0L0 14ZM4 0L6 0L5 14Z' },
];
