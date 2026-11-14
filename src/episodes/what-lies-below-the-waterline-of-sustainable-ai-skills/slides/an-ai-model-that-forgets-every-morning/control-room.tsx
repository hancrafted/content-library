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
import { SCENE_HEIGHT, SCENE_WIDTH, SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { useId } from 'react';
import styles from './forgets.module.css';
import { Clock, MorningRoom } from './room-art';

/*
 * The control room of Slide 1, drawn in `ZoneScene`'s 1200 by 800 space: the Spec's faceted wall with one window,
 * through which the Surface sky and the ship's stern deck show, the robot idle on deck beside the empty A-frame, and
 * the wall clock at 07:00. The wall, floor, window frame and clock are this Slide's own scenery (`room-art.tsx`);
 * every figure comes from `slide-shared/` (design-ADR 0025).
 */

/** The window onto the stern deck, in the Scene's units. */
const WINDOW = { x: 620, y: 70, width: 380, height: 240 } as const;
const FLOOR_Y = 770;
/** One scale for the crew and the console: a comic close-up; its CSS module turns the speech bubbles down to match. */
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

/** The wall around the window, as one path with the window cut out (`evenodd`): the wall's facets are clipped to it. */
const WALL = [
  `M0 0H${SCENE_WIDTH}V${FLOOR_Y}H0Z`,
  `M${WINDOW.x} ${WINDOW.y}h${WINDOW.width}v${WINDOW.height}h${-WINDOW.width}Z`,
].join('');

/** The wall clock, right of the window and clear of both lines: 07:00 every morning. */
const CLOCK = { cx: 1040, cy: 120, r: 30 } as const;
const WINDOW_FRAME = 16;
const WINDOW_GLINT = 5;
const MULLION = 10;

/** What the window shows: the ship's stern deck, the robot idle in its cradle, the A-frame's hook empty. */
function SternDeck() {
  const { robot } = ANCHORS;
  return (
    <Ship
      transform={`translate(${SHIP_X} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`}
      deck={
        <g transform={`translate(${robot.x} ${robot.y - ROBOT_HEIGHT * ROBOT_SCALE}) scale(${ROBOT_SCALE})`}>
          <Robot state={robotAt('an-ai-model-that-forgets-every-morning').state} lamp={false} />
        </g>
      }
    />
  );
}

/** The faceted wall round its window, the floor, the window's wooden frame and mullion, and the clock. */
function RoomWalls({ clipId }: { readonly clipId: string }) {
  const lit = `M${WINDOW.x} ${WINDOW.y + WINDOW.height}V${WINDOW.y}H${WINDOW.x + WINDOW.width}`;
  return (
    <g className={styles.room}>
      <MorningRoom
        width={SCENE_WIDTH}
        floorY={FLOOR_Y}
        bottom={SCENE_HEIGHT}
        clipId={clipId}
        clip={<path d={WALL} clipRule="evenodd" />}
      />
      <rect {...WINDOW} strokeWidth={WINDOW_FRAME} data-tone="window" />
      <path d={lit} strokeWidth={WINDOW_GLINT} data-tone="window-lit" />
      <line
        x1={WINDOW.x + WINDOW.width / 2}
        y1={WINDOW.y}
        x2={WINDOW.x + WINDOW.width / 2}
        y2={WINDOW.y + WINDOW.height}
        strokeWidth={MULLION}
        data-tone="window"
      />
      <Clock {...CLOCK} />
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
  const clipId = `forgets-window-${useId()}`;
  const layout = consoleLayout({ width: CONSOLE_WIDTH, mugs });
  const consoleY = FLOOR_Y - CONSOLE_DESK_HEIGHT * CREW_SCALE;
  const seatX = CONSOLE_X + layout.seat.x * CREW_SCALE;
  return (
    <>
      <SternDeck />
      <RoomWalls clipId={clipId} />
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
