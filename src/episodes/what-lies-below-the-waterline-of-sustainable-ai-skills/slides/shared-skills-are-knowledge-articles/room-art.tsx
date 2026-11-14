import styles from './room-art.module.css';
import { type ArtFacet, MANUAL, ROOM, SHELF } from './room-facets';

/** The Spec's drawing space for the room: 1200 by 560, the floor line at 486. */
export const ROOM_ART = { width: 1200, height: 560, floor: 486 } as const;

/** The Scene's box shows the whole Spec drawing: its aspect, for the Scene's class string. */
export const ROOM_ASPECT = 'aspect-[15/7]';

/** Facets in paint order, each a path its tone colours. */
function Facets({ facets }: { readonly facets: readonly ArtFacet[] }) {
  return facets.map(([tone, d], index) => <path key={index} data-tone={tone} d={d} />);
}

/**
 * The control room of Spec Option 20b, this Slide's own drawing (feedback 3, decision 46): the faceted wall and floor,
 * the porthole onto the Midnight water, the institute's shelf of manuals and the fleet manual open on its lectern, its
 * page left for the HTML that names the shared skill. Its tones live in `room-art.module.css`. Scenery only, in the
 * Spec's units: the shared cast stands in front of it on `ROOM_ART.floor`.
 */
export function RoomArt() {
  return (
    <g aria-hidden data-room-art className={styles.art}>
      <Facets facets={ROOM} />
      <Facets facets={SHELF} />
      <Facets facets={MANUAL} />
    </g>
  );
}
