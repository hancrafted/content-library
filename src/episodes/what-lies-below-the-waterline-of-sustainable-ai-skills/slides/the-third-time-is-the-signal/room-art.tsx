import type { ReactNode } from 'react';
import styles from './room-art.module.css';
import { ROOM, type ArtFacet } from './room-facets';

/** The room's drawing space, the Spec's: 360 by 280, figures standing on the floor line at 256. */
export const ROOM_ART = { width: 360, height: 280, floor: 256 } as const;

/** The A-frame's head over the rail, where the cable runs down into the sea. */
const CABLE = { x: 313, top: 40, rail: 74 } as const;

/** Facets in paint order, each a path its tone colours. */
export function Facets({ facets }: { readonly facets: readonly ArtFacet[] }) {
  return facets.map(([tone, d], index) => <path key={index} data-tone={tone} d={d} />);
}

/**
 * The control room of Spec Option 8a, this Slide's own drawing (feedback 3, decision 46): the faceted wall and floor,
 * the window onto the deck, its sky, clouds and sea, the rail and the A-frame with its cable running down over the
 * side, and the wall clock. Its tones live in `room-art.module.css`. Scenery only: the shared Console and cast stand in
 * front of it as `children`, on `ROOM_ART.floor`.
 */
export function RoomArt({ children }: { readonly children?: ReactNode }) {
  return (
    <g data-room-art className={styles.art}>
      <Facets facets={ROOM} />
      <line
        data-cable
        x1={CABLE.x}
        y1={CABLE.top}
        x2={CABLE.x}
        y2={CABLE.rail}
        data-tone="hull"
        className={styles.cable}
      />
      {children}
    </g>
  );
}
