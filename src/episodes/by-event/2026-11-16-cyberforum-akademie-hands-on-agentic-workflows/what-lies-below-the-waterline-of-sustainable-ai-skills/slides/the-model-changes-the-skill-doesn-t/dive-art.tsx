import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { CABIN, GLOW, PORT, SILT, type Facet } from './dive-facets';
import { SWITCH_SEA } from './switch-sea';
import { UPDATE_SEA } from './update-sea';

export type DiveHalf = 'update' | 'switch';

export const DIVE_WIDTH = 560;
export const DIVE_HEIGHT = 420;
export const PORTHOLE = { x: 68, y: 116, r: 50 } as const;

const SEAS: Record<DiveHalf, readonly Facet[]> = { update: UPDATE_SEA, switch: SWITCH_SEA };

export function DiveSea({ half }: { readonly half: DiveHalf }) {
  return (
    <g aria-hidden data-dive-art>
      <ToneFacets facets={SEAS[half]} />
      <ToneFacets facets={GLOW} />
    </g>
  );
}

export function Cabin() {
  return <ToneFacets facets={CABIN} />;
}

export function PortRim() {
  return (
    <g aria-hidden>
      <ToneFacets facets={PORT} />
    </g>
  );
}

export function Silt({ className }: { readonly className?: string }) {
  return (
    <g aria-hidden className={className}>
      <ToneFacets facets={SILT} />
    </g>
  );
}
