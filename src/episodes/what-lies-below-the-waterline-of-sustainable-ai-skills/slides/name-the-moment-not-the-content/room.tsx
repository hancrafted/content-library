import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import styles from './slide.module.css';

/** The room's floor line in the Scene's 1200 by 800 space; the art box shows its lower 600 units. */
const FLOOR = 730;
const CREW_SCALE = 1.8;
const CONSOLE_WIDTH = 120;
const CONSOLE_X = 260;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;

/**
 * The control room on the day of the dive (Option 12a): the captain stands and gestures at the left, the pilot sits at
 * the console facing the index on the wall; no window, since the robot is not this Slide's subject. Figures are the
 * shared cast (design-ADR 0025); the floor is this Slide's own scenery.
 */
export function ControlRoom() {
  return (
    <g className={styles.room}>
      <g aria-hidden className={styles.floor}>
        <polygon data-tone="floor-lit" points={`0,${FLOOR} 420,${FLOOR} 300,800 0,800`} />
        <polygon data-tone="floor" points={`420,${FLOOR} 900,${FLOOR} 820,800 300,800`} />
        <polygon data-tone="floor-shade" points={`900,${FLOOR} 1200,${FLOOR} 1200,800 820,800`} />
      </g>
      <g transform={`translate(0 ${FLOOR}) scale(${CREW_SCALE})`}>
        <g transform="translate(60 0)">
          <Character preset={captain} pose="point" />
        </g>
        <g transform={`translate(${CONSOLE_X} ${-70})`}>
          <Console width={CONSOLE_WIDTH} mugs={1} />
          <g transform={`translate(${SEAT.x} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
    </g>
  );
}
