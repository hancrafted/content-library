import { Character, type Preset } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { SCENE_HEIGHT } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { ROOM_ART, RoomArt } from './room-art';
import styles from './slide.module.css';

const ROOM_TOP = SCENE_HEIGHT - ROOM_ART.height;
const PAGE_EDGE = { x: 762, y: 300 } as const;
const DESK_ROWS = [200, 316, 432] as const;
const DESK_X = 892;
const REACH_END = 824;
const CONSOLE_SCALE = 0.6;
const CONSOLE_WIDTH = 200;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
const CAPTAIN = { x: 150, scale: 2.7 } as const;

const captainWithNotebook: Preset = { ...captain, prop: 'clipboard' };

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

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
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
