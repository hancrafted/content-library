import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import styles from './forgets.module.css';

/*
 * The control room of Slide 1, drawn in `ZoneScene`'s 1200 by 800 space: a faceted wall with one window, through which
 * the Surface sky and the ship's stern deck show, the robot idle on deck beside the empty A-frame. The wall, floor and
 * window frame are this Slide's own scenery; every figure comes from `slide-shared/` (design-ADR 0025).
 */

/** The window onto the stern deck, in the Scene's units. */
const WINDOW = { x: 620, y: 70, width: 440, height: 240 } as const;
const FLOOR_Y = 770;
/** One scale for the crew and the console: a comic close-up, large enough that the speech bubbles read. */
const CREW_SCALE = 4.4;
const CONSOLE_WIDTH = 90;
const CONSOLE_X = 864;
/** The stern deck seen through the window: the ship big enough that its A-frame fills the glass. */
const SHIP_SCALE = 2.6;
const SHIP_X = 1086;
const ROBOT_SCALE = 0.55;
/** The robot is drawn hanging from its cable at (0, 0); this lifts it to sit on its cradle. */
const ROBOT_HEIGHT = 59;
const CAPTAIN_X = 210;
/** The captain stands nearer the viewer, so her line rises above the pilot's greeting. */
const CAPTAIN_SCALE = 5;

const ANCHORS = shipAnchors();

/** The wall around the window, as one path with the window cut out (`evenodd`). */
const WALL = [
  `M0 0H1200V${FLOOR_Y}H0Z`,
  `M${WINDOW.x} ${WINDOW.y}h${WINDOW.width}v${WINDOW.height}h${-WINDOW.width}Z`,
].join('');

/** The wall's lit and shaded planes, outside the window, lit from the upper left. */
const WALL_FACETS = [
  { tone: 'room-lit', points: '0,0 420,0 140,380' },
  { tone: 'room-lit', points: '420,0 600,0 600,240 300,200' },
  { tone: 'room-shade', points: `600,420 1200,380 1200,${FLOOR_Y} 760,${FLOOR_Y}` },
  { tone: 'room-shade', points: `0,520 260,${FLOOR_Y} 0,${FLOOR_Y}` },
] as const;

const FLOOR_FACETS = [
  { tone: 'floor', points: `0,${FLOOR_Y} 1200,${FLOOR_Y} 1200,800 0,800` },
  { tone: 'floor-shade', points: `640,${FLOOR_Y} 1200,${FLOOR_Y} 1200,800 900,800` },
] as const;

/** What the window shows: the ship's stern deck, the robot idle in its cradle, the A-frame's hook empty. */
function SternDeck() {
  const { robot } = ANCHORS;
  return (
    <Ship
      transform={`translate(${SHIP_X} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`}
      deck={
        <g transform={`translate(${robot.x} ${robot.y - ROBOT_HEIGHT * ROBOT_SCALE}) scale(${ROBOT_SCALE})`}>
          <Robot lamp={false} />
        </g>
      }
    />
  );
}

/** The wall with its window, the window frame and the floor. */
function RoomWalls() {
  return (
    <g className={styles.room}>
      <path d={WALL} fillRule="evenodd" data-tone="room" />
      {WALL_FACETS.map(({ tone, points }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
      <rect {...WINDOW} strokeWidth={16} data-tone="frame" />
      <line
        x1={WINDOW.x + WINDOW.width / 2}
        y1={WINDOW.y}
        x2={WINDOW.x + WINDOW.width / 2}
        y2={WINDOW.y + WINDOW.height}
        strokeWidth={10}
        data-tone="frame"
      />
      {FLOOR_FACETS.map(({ tone, points }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
    </g>
  );
}

export interface ControlRoomProps {
  /** The morning: its number of coffee mugs on the console, the one thing that changes. */
  readonly mugs: number;
  /** What the captain explains, again. */
  readonly captainLine: string;
  /** What the pilot says, every morning. */
  readonly greeting: string;
}

/**
 * One morning in the control room (Spec Option 1a's `MorningScene`): the captain standing and explaining, the pilot
 * turned from his console to greet her as a stranger, the stern deck through the window. Only the mug count changes,
 * so the repeat is the joke. Children of a `ZoneScene` at the Surface.
 */
export function ControlRoom({ mugs, captainLine, greeting }: ControlRoomProps) {
  const layout = consoleLayout({ width: CONSOLE_WIDTH, mugs });
  const consoleY = FLOOR_Y - CONSOLE_DESK_HEIGHT * CREW_SCALE;
  const seatX = CONSOLE_X + layout.seat.x * CREW_SCALE;
  return (
    <>
      <SternDeck />
      <RoomWalls />
      <Console
        width={CONSOLE_WIDTH}
        mugs={mugs}
        transform={`translate(${CONSOLE_X} ${consoleY}) scale(${CREW_SCALE})`}
      />
      <g transform={`translate(${seatX} ${FLOOR_Y}) scale(${CREW_SCALE})`}>
        <Character preset={pilot} pose="sit" flip says={greeting} />
      </g>
      <g transform={`translate(${CAPTAIN_X} ${FLOOR_Y}) scale(${CAPTAIN_SCALE})`}>
        <Character preset={captain} pose="point" says={captainLine} />
      </g>
    </>
  );
}
