import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import type { ReactNode } from 'react';
import styles from './shallows-art.module.css';
import type { ArtFacet } from './shallows-facets';

/** The Spec's drawing space for one test dive: 560 by 330, its lit waterline at 112 and its seabed's top near 280. */
const SPEC = { width: 560, height: 330, waterline: 112, bed: 280 } as const;
/** The Spec drawing scaled to the Scene's width and set on its bottom edge, where the Scene's `slice` anchors. */
const SCALE = SCENE_WIDTH / SPEC.width;
const TOP = SCENE_HEIGHT - SPEC.height * SCALE;

/** A point of the Spec's drawing, in the Scene's 1200 by 800 space, for placing the shared cast on it. */
export const atSpec = (x: number, y: number) => ({ x: x * SCALE, y: TOP + y * SCALE });

/** Where the shared cast stands in the Scene's space: the Spec's waterline and the top of its seabed. */
export const SHALLOWS = { waterline: atSpec(0, SPEC.waterline).y, bed: atSpec(0, SPEC.bed).y } as const;

/** The Scene's box shows the whole Spec drawing: its aspect, for the Scene's class string. */
export const SHALLOWS_ASPECT = 'aspect-[56/33]';

/** Facets in paint order, each a path its tone colours. */
export function Facets({ facets }: { readonly facets: readonly ArtFacet[] }) {
  return facets.map(([tone, d], index) => <path key={index} data-tone={tone} d={d} />);
}

/**
 * The test dive's own drawing from Spec Option 22a (feedback 3, decision 46), in the Spec's units scaled onto the
 * Scene: `children` are more facets of it (the silt, the card, the bubbles) drawn in the same units. Scenery only: the
 * shared ship and robot are placed on top in the Scene's own space, at `atSpec` points.
 */
export function ShallowsArt({ children }: { readonly children?: ReactNode }) {
  return (
    <g aria-hidden data-shallows-art className={styles.art} transform={`translate(0 ${TOP}) scale(${SCALE})`}>
      {children}
    </g>
  );
}
