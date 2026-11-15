import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { CABIN, GLOW, PORT, SILT, type Facet } from './dive-facets';
import { SWITCH_SEA } from './switch-sea';
import { UPDATE_SEA } from './update-sea';

/*
 * The drawing lifted from the approved Spec's Option 24a (feedback 3, decision 46): each dive's whole depth in one
 * picture, sky and clouds, the water from the Surface down to the Abyss, the light rays and the rocky seabed, the
 * waterline's glow, the porthole's faceted rim and the cabin behind it, and the silt cloud. Facets keep the Spec's own
 * numbers in its 560 by 420 space; their tones are this Slide's tokens in `dive.module.css`. The ship, both robots and
 * the reader stay the shared figures, placed on top by `dive-scene.tsx`.
 */

export type DiveHalf = 'update' | 'switch';

/** The Spec's dive drawing's box. */
export const DIVE_WIDTH = 560;
export const DIVE_HEIGHT = 420;
/** The porthole's centre and its glass's radius, where the reader sits. */
export const PORTHOLE = { x: 68, y: 116, r: 50 } as const;

const SEAS: Record<DiveHalf, readonly Facet[]> = { update: UPDATE_SEA, switch: SWITCH_SEA };

/** The dive's depth behind every figure, and the waterline's glow over it. */
export function DiveSea({ half }: { readonly half: DiveHalf }) {
  return (
    <g aria-hidden data-dive-art>
      <ToneFacets facets={SEAS[half]} />
      <ToneFacets facets={GLOW} />
    </g>
  );
}

/** The cabin's wall and chair behind the reader; the porthole's clip shows them inside the glass. */
export function Cabin() {
  return <ToneFacets facets={CABIN} />;
}

/** The porthole's rim over the reader's edge. */
export function PortRim() {
  return (
    <g aria-hidden>
      <ToneFacets facets={PORT} />
    </g>
  );
}

/** The silt the robot stirs up in the seabed. */
export function Silt({ className }: { readonly className?: string }) {
  return (
    <g aria-hidden className={className}>
      <ToneFacets facets={SILT} />
    </g>
  );
}
