import { Art } from '../../art/art';
import { placeTransform, type GroupProps } from './creature-group.pure';
import type { FacetLayer } from './facet-data';
import { Facets } from './facets';
import styles from './fish-school.module.css';
import { scatter } from './scenery.pure';

export function FishSchool({ x, y, at, count = 11, seed = 1, scale = 1.3, flip = false }: GroupProps) {
  const fish = at ?? scatter({ count, seed, spread: [110, 32], gap: [30 * scale, 16 * scale] });
  return (
    <g className={styles.school} data-fish-school transform={`translate(${x} ${y})`}>
      <g className={styles.sway} data-motion="ambient">
        {fish.map((p) => (
          <g key={`${p.x}:${p.y}`} data-fish transform={placeTransform(p, scale, flip)}>
            <Art name="fish">
              <Facets layers={FISH} />
            </Art>
          </g>
        ))}
      </g>
    </g>
  );
}

const FISH: readonly FacetLayer[] = [
  { tone: 'fish-lit', d: 'M-10 0L-2 -5.5L0 0ZM-2 -5.5L9 -2.5L0 0Z' },
  { tone: 'fish-shade', d: 'M9 -2.5L12 0L0 0ZM12 0L9 3L0 0ZM9 3L-2 5L0 0Z' },
  { tone: 'fish-lit', d: 'M-2 5L-10 0L0 0ZM-10 0L-17 -5L-15 0Z' },
  { tone: 'fish-shade', d: 'M-10 0L-15 0L-17 5Z' },
  { tone: 'glint', d: 'M6 -1.6L7.8 -1.6L7.8 0L6 0Z' },
];
