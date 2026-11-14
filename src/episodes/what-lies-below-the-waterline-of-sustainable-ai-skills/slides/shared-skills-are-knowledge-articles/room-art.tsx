import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import styles from './room-art.module.css';
import { MANUAL, ROOM, SHELF } from './room-facets';

/** The Spec's drawing space for the room: 1200 by 560, the floor line at 486. */
export const ROOM_ART = { width: 1200, height: 560, floor: 486 } as const;

/** The Scene's box shows the whole Spec drawing: its aspect, for the Scene's class string. */
export const ROOM_ASPECT = 'aspect-[15/7]';

/**
 * The control room of Spec Option 20b, this Slide's own drawing (feedback 3, decision 46): the faceted wall and floor,
 * the porthole onto the Midnight water, the institute's shelf of manuals and the fleet manual open on its lectern, its
 * page left for the HTML that names the shared skill. Its tones live in `room-art.module.css`. Scenery only, in the
 * Spec's units: the shared cast stands in front of it on `ROOM_ART.floor`.
 */
export function RoomArt() {
  return (
    <g aria-hidden data-room-art className={styles.art}>
      <ToneFacets facets={ROOM} />
      <ToneFacets facets={SHELF} />
      <ToneFacets facets={MANUAL} />
    </g>
  );
}
