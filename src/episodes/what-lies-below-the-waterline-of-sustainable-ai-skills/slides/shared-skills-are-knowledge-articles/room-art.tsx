import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import styles from './room-art.module.css';
import { MANUAL, ROOM, SHELF } from './room-facets';

export const ROOM_ART = { width: 1200, height: 560, floor: 486 } as const;

export const ROOM_ASPECT = 'aspect-[15/7]';

export function RoomArt() {
  return (
    <g aria-hidden data-room-art className={styles.art}>
      <ToneFacets facets={ROOM} />
      <ToneFacets facets={SHELF} />
      <ToneFacets facets={MANUAL} />
    </g>
  );
}
