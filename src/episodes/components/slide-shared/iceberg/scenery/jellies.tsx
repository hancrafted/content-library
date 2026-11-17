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

/**
 * Frozen interface (decisions 15–17 of feedback 2; pinned by `fable-elements.test.ts` and its slow sibling). A Fable
 * redraw changes only the `JELLY` facets below and `jellies.module.css`.
 *
 * - Props: `GroupProps` without `flip` (`x`, `y`, `at`, `count`, `seed` = 1, `scale` = 1); two jellies by default.
 * - Box: one jelly at size 1 stays within x -12 to 12, y -12 (bell top) to 16 (tentacle tips) about its centre.
 * - Hooks: root `data-jellies`; each member `data-jelly`.
 * - Tokens it mixes from: `--info`, `--on-brand-accent`, `--overlay`, with `transparent`.
 * - Motion: each jelly is `data-motion="ambient"`, the Twilight zone's drifting loop, bobbing on its own beat under
 *   `[data-zone='active']` only, never under reduced motion; transform and opacity only (decision 19).
 */
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
