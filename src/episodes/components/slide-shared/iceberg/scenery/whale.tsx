import { Art } from '../../art/art';
import type { FacetLayer } from './facet-data';
import { Facets } from './facets';
import styles from './whale.module.css';

/**
 * Frozen interface (decisions 15–17 of feedback 2; pinned by `fable-elements.test.ts` and its slow sibling). A Fable
 * redraw changes only the `WHALE` facets below and `whale.module.css`.
 *
 * - Props: `x`, `y`, `scale` = 0.8, `flip`, as typed here.
 * - Box: at scale 1 the whale stays within x -215 to 190, y -60 to 85 about its centre, facing right.
 * - Hooks: root `data-whale`.
 * - Tokens it mixes from: `--info`, `--bulb`, `--on-brand-accent`, `--overlay`.
 * - Motion: the moving part is `data-motion="ambient"`, the Midnight zone's slow glide, under `[data-zone='active']`
 *   only and never under reduced motion; transform and opacity only (decision 19). Fins may move on their own
 *   (decision 20).
 */
export interface WhaleProps {
  /** The whale's centre in the Scene. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** Faces the whale left instead of right. */
  readonly flip?: boolean;
}

/** A humpback in large hand-cut planes, the Midnight zone's creature, gliding slowly back and forth. */
export function Whale({ x, y, scale = 0.8, flip = false }: WhaleProps) {
  return (
    <g
      className={styles.whale}
      data-whale
      transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`}
    >
      <g className={styles.glide} data-motion="ambient">
        <Art name="whale">
          <Facets layers={WHALE} />
        </Art>
      </g>
    </g>
  );
}

// The drawing: the humpback from the Spec's `parts.py` (seed 25), back lit to the upper left, pale belly below.
const WHALE: readonly FacetLayer[] = [
  { tone: 'whale-lit', d: 'M-150 -6L-110 -15L-110 0.7Z' },
  { tone: 'whale', d: 'M-150 -6L-110 0.7L-150 1Z' },
  { tone: 'whale-shade', d: 'M-150 1L-110 0.7L-110 12ZM-150 1L-110 12L-150 6Z' },
  { tone: 'whale', d: 'M-110 -15L-60 -25L-60 1.7Z' },
  { tone: 'whale-lit', d: 'M-110 -15L-60 1.7L-110 0.7Z' },
  { tone: 'whale-shade', d: 'M-110 0.7L-60 1.7L-60 21Z' },
  { tone: 'whale', d: 'M-110 0.7L-60 21L-110 12Z' },
  { tone: 'whale-lit', d: 'M-60 -25L-10 -33L-10 3.5Z' },
  { tone: 'whale', d: 'M-60 -25L-10 3.5L-60 1.7Z' },
  { tone: 'whale-shade', d: 'M-60 1.7L-10 3.5L-10 30ZM-60 1.7L-10 30L-60 21Z' },
  { tone: 'whale', d: 'M-10 -33L40 -37L40 5.9Z' },
  { tone: 'whale-lit', d: 'M-10 -33L40 5.9L-10 3.5Z' },
  { tone: 'whale-shade', d: 'M-10 3.5L40 5.9L40 37Z' },
  { tone: 'whale', d: 'M-10 3.5L40 37L-10 30Z' },
  { tone: 'whale-lit', d: 'M40 -37L90 -36L90 6.9Z' },
  { tone: 'whale', d: 'M40 -37L90 6.9L40 5.9Z' },
  { tone: 'whale-belly', d: 'M40 5.9L90 6.9L90 17.3L40 16.3Z' },
  { tone: 'whale-belly-shade', d: 'M40 16.3L90 17.3L90 27.6L40 26.6Z' },
  { tone: 'whale-belly', d: 'M40 26.6L90 27.6L90 38L40 37Z' },
  { tone: 'whale', d: 'M90 -36L130 -30L130 6Z' },
  { tone: 'whale-lit', d: 'M90 -36L130 6L90 6.9Z' },
  { tone: 'whale-belly', d: 'M90 6.9L130 6L130 14.6L90 17.3Z' },
  { tone: 'whale-belly-shade', d: 'M90 17.3L130 14.6L130 23.3L90 27.6Z' },
  { tone: 'whale-belly', d: 'M90 27.6L130 23.3L130 32L90 38Z' },
  { tone: 'whale-lit', d: 'M130 -30L160 -20L160 4.4Z' },
  { tone: 'whale', d: 'M130 -30L160 4.4L130 6Z' },
  { tone: 'whale-belly', d: 'M130 6L160 4.4L160 10.2L130 14.6Z' },
  { tone: 'whale-belly-shade', d: 'M130 14.6L160 10.2L160 16.1L130 23.3Z' },
  { tone: 'whale-belly', d: 'M130 23.3L160 16.1L160 22L130 32Z' },
  { tone: 'whale', d: 'M160 -20L184 -6L184 2.1Z' },
  { tone: 'whale-lit', d: 'M160 -20L184 2.1L160 4.4Z' },
  { tone: 'whale-belly', d: 'M160 4.4L184 2.1L184 4.1L160 10.2Z' },
  { tone: 'whale-belly-shade', d: 'M160 10.2L184 4.1L184 6L160 16.1Z' },
  { tone: 'whale-belly', d: 'M160 16.1L184 6L184 8L160 22Z' },
  { tone: 'whale-lit', d: 'M-150 -6L-206 -42L-212 -30L-184 -2Z' },
  { tone: 'whale-shade', d: 'M-150 6L-184 -2L-212 30L-204 40Z' },
  { tone: 'whale', d: 'M-150 -6L-184 -2L-150 6Z' },
  { tone: 'whale-shade', d: 'M70 30L100 34L-10 82L-24 80Z' },
  { tone: 'whale', d: 'M70 30L84 32L-24 80Z' },
  { tone: 'glint', d: 'M150 -14L156 -17L157 -10Z' },
];
