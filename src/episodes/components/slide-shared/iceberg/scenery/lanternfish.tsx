import { placeTransform, type GroupProps } from './creature-group.pure';
import styles from './lanternfish.module.css';
import { scatter } from './scenery.pure';

const DART_STAGGER_SECONDS = 1.7;

/**
 * A school of lanternfish, the Twilight Section titles' creatures (decision 11 of feedback 2): small dark fish, a row
 * of glowing photophores along each belly, each darting on its own beat. A placeholder for the Fable redraw.
 *
 * Frozen interface (decisions 15–17 of feedback 2; pinned by `fable-elements.test.ts` and its slow sibling). A Fable
 * redraw changes only `LANTERNFISH` below and `lanternfish.module.css`.
 *
 * - Props: `GroupProps` (`x`, `y`, `at`, `count` = 9, `seed` = 3, `scale` = 1.2, `flip`).
 * - Box: one fish at size 1 stays within x -15 to 13, y -7 to 7 about its centre, facing right.
 * - Hooks: root `data-lanternfish-school`; each member `data-lanternfish`, placed by `placeTransform`.
 * - Tokens it mixes from: `--info`, `--on-brand-accent`, `--overlay`.
 * - Motion: each fish is `data-motion="ambient"` and darts on its own (decision 20), under `[data-zone='active']`
 *   only and never under reduced motion; transform and opacity only (decision 19).
 */
export function Lanternfish({ x, y, at, count = 9, seed = 3, scale = 1.2, flip = false }: GroupProps) {
  const school = at ?? scatter({ count, seed, spread: [120, 44], gap: [34 * scale, 14 * scale] });
  return (
    <g className={styles.lanternfish} data-lanternfish-school transform={`translate(${x} ${y})`}>
      {school.map((p, index) => (
        <g key={`${p.x}:${p.y}`} data-lanternfish transform={placeTransform(p, scale, flip)}>
          <g
            className={styles.dart}
            data-motion="ambient"
            style={{ animationDelay: `${-index * DART_STAGGER_SECONDS}s` }}
          >
            {LANTERNFISH.map(({ tone, points }) => (
              <polygon key={points} data-tone={tone} points={points} />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}

/** A photophore: a small diamond at (x, y). */
const light = (x: number, y = 2.6, r = 0.9) => `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;

// The drawing: a blunt-headed fish lit along its back from the upper left, a big eye and four photophores.
const LANTERNFISH: readonly { readonly tone: string; readonly points: string }[] = [
  { tone: 'lantern-lit', points: '12,0 2,-5 -8,-2 0,0' },
  { tone: 'lantern', points: '12,0 0,0 -8,2 2,4.5' },
  { tone: 'lantern-lit', points: '-8,-2 -14.5,-6 -12,0' },
  { tone: 'lantern', points: '-12,0 -14.5,6 -8,2' },
  { tone: 'glint', points: '7,-2 9.5,-1.2 8,0.4' },
  ...[-4, -1, 2, 5].map((x) => ({ tone: 'lantern-glow', points: light(x) })),
];
