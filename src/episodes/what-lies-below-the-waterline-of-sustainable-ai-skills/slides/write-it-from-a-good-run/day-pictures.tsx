import type { Mood } from '@/episodes/components/slide-shared/character/actor';
import { Character, type Pose } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Seabed } from '@/episodes/components/slide-shared/iceberg/scenery/seabed';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { ControlRoom, FLOOR, PinnedCard, ROOM_HEIGHT, ROOM_WIDTH, type RoomTime } from './control-room';
import styles from './slide.module.css';

const CONSOLE = { x: 200, width: 92 } as const;
const CAPTAIN_X = 50;
const FIGURE_SCALE = 0.85;
const DESK_TOP = FLOOR - CONSOLE_DESK_HEIGHT;
const SEAT = consoleLayout({ width: CONSOLE.width }).seat;

/** The dive, in the Sunlit zone's own Scene: the robot hangs on its cable, 2 m above the seabed. */
const DIVE = { x: 600, robotY: 470, seabedY: 640, scale: 4 } as const;

/** Panel 1: this morning's run went well, the robot holding 2 m over the seabed, lamp down. */
export function RunPicture({ label, depth }: { readonly label: string; readonly depth: string }) {
  return (
    <ZoneScene
      zone="sunlit"
      label={label}
      className="aspect-[300/180] w-full"
      overlay={
        <span
          data-depth-bracket
          className="absolute right-[18%] bottom-[18%] border-y-2 border-r-2 border-foreground px-1 text-caption font-semibold"
        >
          {depth}
        </span>
      }
    >
      <Seabed y={DIVE.seabedY} />
      <line x1={DIVE.x} y1={0} x2={DIVE.x} y2={DIVE.robotY} strokeWidth={4} className="stroke-foreground/50" />
      <g transform={`translate(${DIVE.x} ${DIVE.robotY}) scale(${DIVE.scale})`}>
        <Robot aim="down" />
      </g>
    </ZoneScene>
  );
}

export type RoomPanel = 'interview' | 'writing' | 'next-morning';

/**
 * Each room panel's hour and cast: the pilot turns to ask the captain why; at dusk he writes the card alone at his
 * console; the next morning the card hangs on the wall and he greets the captain as a stranger.
 */
const ROOM_PANELS: Record<
  RoomPanel,
  { time: RoomTime; pilotMood: Mood; turns: boolean; captain?: Pose; card: boolean }
> = {
  interview: { time: 'day', pilotMood: 'confused', turns: true, captain: 'point', card: false },
  writing: { time: 'dusk', pilotMood: 'thinking', turns: false, card: false },
  'next-morning': { time: 'dawn', pilotMood: 'blank', turns: true, captain: 'stand', card: true },
};

interface RoomPictureProps {
  readonly panel: RoomPanel;
  readonly label: string;
  /** What the pilot says, in the next morning's panel only. */
  readonly greeting?: string;
}

/** Panels 2 to 4, in the control room. The room is this Slide's; the people and the console are the shared figures. */
export function RoomPicture({ panel, label, greeting }: RoomPictureProps) {
  const { time, pilotMood, turns, captain: captainPose, card } = ROOM_PANELS[panel];
  const motion = panel === 'interview' ? 'turn-to' : undefined;
  return (
    <svg
      viewBox={`0 0 ${ROOM_WIDTH} ${ROOM_HEIGHT}`}
      role="img"
      aria-label={label}
      data-room-panel={panel}
      className={`block h-auto w-full ${styles.roomPicture}`}
    >
      <ControlRoom time={time}>
        {card && <PinnedCard x={96} y={20} />}
        <Console width={CONSOLE.width} mugs={1} transform={`translate(${CONSOLE.x} ${DESK_TOP})`} />
        <g transform={`translate(${CONSOLE.x + SEAT.x} ${FLOOR}) scale(${FIGURE_SCALE})`}>
          <Character preset={pilot} pose="sit" motion={motion} mood={pilotMood} says={greeting} flip={turns} />
        </g>
        {captainPose && (
          <g transform={`translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
            <Character preset={captain} pose={captainPose} />
          </g>
        )}
      </ControlRoom>
    </svg>
  );
}
