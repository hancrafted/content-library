import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { seaFacets } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import styles from './slide.module.css';

const WALL = seaFacets({ width: SCENE_WIDTH, height: SCENE_HEIGHT, cell: 190, seed: 31 });

/** The control-room wall the clipboard hangs on, faceted and lit from the upper left; it covers the whole Scene. */
export function RoomWall() {
  return (
    <g data-room-wall className={styles.wall}>
      {WALL.map(({ points, tone }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
    </g>
  );
}
