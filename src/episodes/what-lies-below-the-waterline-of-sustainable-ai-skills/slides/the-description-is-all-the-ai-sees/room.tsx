import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import styles from './slide.module.css';

/** The room's floor line in the Scene's 1200 by 800 space; the Slide's art box shows its lower 600 units. */
const FLOOR = 730;
/** The crew and console at the room's scale. */
const CREW_SCALE = 2;
const CONSOLE_WIDTH = 120;
const CONSOLE_X = 210;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;

/** The faceted floor of the control room, lit from the upper left. */
function Floor() {
  return (
    <g aria-hidden className={styles.floor}>
      <polygon data-tone="floor-lit" points={`0,${FLOOR} 420,${FLOOR} 300,800 0,800`} />
      <polygon data-tone="floor" points={`420,${FLOOR} 900,${FLOOR} 820,800 300,800`} />
      <polygon data-tone="floor-shade" points={`900,${FLOOR} 1200,${FLOOR} 1200,800 820,800`} />
    </g>
  );
}

/** The window onto the sea: the new site, its marker buoy bobbing on the surface. */
function Window() {
  return (
    <g aria-hidden transform="translate(250 230)" className={styles.window}>
      <rect data-tone="frame" x={-10} y={-10} width={280} height={190} rx={6} />
      <rect data-tone="sky" x={0} y={0} width={260} height={100} />
      <rect data-tone="sea" x={0} y={100} width={260} height={70} />
      <polygon data-tone="buoy" points="96,104 112,104 116,124 92,124" />
      <line data-tone="pole" x1={104} y1={104} x2={104} y2={70} strokeWidth={3} />
      <polygon data-tone="flag" points="104,70 128,78 104,86" />
      <line data-tone="frame" x1={130} y1={0} x2={130} y2={170} strokeWidth={6} />
    </g>
  );
}

/** Closed procedure cards fanned behind the index: shut, greyed, never opened on this Slide. */
function ShutCards({ count }: { readonly count: number }) {
  return (
    <g aria-hidden className={styles.shut}>
      {Array.from({ length: count }, (_, index) => (
        <rect
          key={index}
          data-tone={index % 2 === 0 ? 'shut' : 'shut-shade'}
          x={0}
          y={0}
          width={190}
          height={330}
          rx={6}
          transform={`translate(${950 + index * 26} ${300 + index * 12}) rotate(${4 + index * 5})`}
        />
      ))}
    </g>
  );
}

/**
 * The control room from the pilot's chair (Option 11a): the captain at the left calls out the new site, the pilot sits
 * at the console, the window shows the buoy at the new site, and the closed cards stand behind the index. Figures are
 * the shared cast (design-ADR 0025); the floor, window, cone and cards are this Slide's own scenery.
 */
export function ControlRoom({ says }: { readonly says: string }) {
  return (
    <g className={styles.room}>
      <Floor />
      <Window />
      <polygon aria-hidden points="560,560 960,260 960,720" className={styles.cone} />
      <ShutCards count={5} />
      <g transform={`translate(0 ${FLOOR}) scale(${CREW_SCALE})`}>
        <g transform="translate(30 0)">
          <Character preset={captain} pose="point" says={says} />
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
