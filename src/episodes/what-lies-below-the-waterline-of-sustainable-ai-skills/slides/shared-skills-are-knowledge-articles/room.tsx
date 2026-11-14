import { Character, type Preset } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { SCENE_HEIGHT } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { ROOM_ART, RoomArt } from './room-art';
import styles from './slide.module.css';

/** The Spec's room sits on the Scene's bottom edge, where the Scene's `slice` anchors it. */
const ROOM_TOP = SCENE_HEIGHT - ROOM_ART.height;
/** Where the reach leaves the manual's page, in the Spec's units. */
const PAGE_EDGE = { x: 762, y: 300 } as const;
/** Each AI's desk top, one row per AI, where the Spec stacks the three consoles; its reach ends just left of it. */
const DESK_ROWS = [200, 316, 432] as const;
const DESK_X = 892;
const REACH_END = 824;
/** The consoles are drawn smaller, stacked up the wall as the Spec draws them. */
const CONSOLE_SCALE = 0.6;
const CONSOLE_WIDTH = 200;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
const CAPTAIN = { x: 150, scale: 2.7 } as const;

/** You, the captain, with your own notebook in hand: the cast's captain carrying the clipboard prop. */
const captainWithNotebook: Preset = { ...captain, prop: 'clipboard' };

/** One AI at its console: the pilot, seated, its screens running the shared version. */
function Reader({ desk }: { readonly desk: number }) {
  return (
    <g transform={`translate(${DESK_X} ${desk}) scale(${CONSOLE_SCALE})`}>
      <Console width={CONSOLE_WIDTH} />
      <g transform={`translate(${SEAT.x} ${SEAT.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
    </g>
  );
}

/** The dotted lines from the manual's page to each reader, drawn in once after the control block is stamped. */
function ReachLines() {
  const { x, y } = PAGE_EDGE;
  return (
    <g aria-hidden data-motion="reach" className={styles.reach}>
      {DESK_ROWS.map((row) => (
        <g key={row}>
          <path
            d={`M${x} ${y}C${x + 38} ${y} ${REACH_END - 34} ${row - 4} ${REACH_END} ${row - 4}`}
            strokeWidth={3}
            strokeDasharray="2 7"
            strokeLinecap="round"
            className={styles.reachLine}
          />
          <circle cx={REACH_END} cy={row - 4} r={5} className={styles.reachDot} />
        </g>
      ))}
    </g>
  );
}

/**
 * The control room at Midnight (Option 20b): you at the left with your notebook, the fleet manual on its lectern under
 * the institute's shelf, and three AIs at their consoles up the right wall, each reached from the manual's page. The
 * room is this Slide's own drawing (`room-art.tsx`), in the Spec's units; the figures and consoles are the shared cast
 * (design-ADR 0025).
 */
export function ControlRoom() {
  return (
    <g transform={`translate(0 ${ROOM_TOP})`}>
      <RoomArt />
      <g transform={`translate(${CAPTAIN.x} ${ROOM_ART.floor}) scale(${CAPTAIN.scale})`}>
        <Character preset={captainWithNotebook} pose="hold" />
      </g>
      <ReachLines />
      {DESK_ROWS.map((row) => (
        <Reader key={row} desk={row} />
      ))}
    </g>
  );
}
