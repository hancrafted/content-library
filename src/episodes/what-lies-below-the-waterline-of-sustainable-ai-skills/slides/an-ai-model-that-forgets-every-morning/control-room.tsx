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

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
const WINDOW = { x: 620, y: 70, width: 380, height: 240 } as const;
const FLOOR_Y = 770;
const CREW_SCALE = 4.4;
const CONSOLE_WIDTH = 90;
const CONSOLE_X = 864;
const SHIP_SCALE = 2.6;
const SHIP_X = 1086;
const ROBOT_SCALE = 0.55;
const ROBOT_HEIGHT = 59;
const CAPTAIN_X = 210;
const CAPTAIN_SCALE = 5;

const ANCHORS = shipAnchors();

const WALL = [
  `M0 0H${SCENE_WIDTH}V${FLOOR_Y}H0Z`,
  `M${WINDOW.x} ${WINDOW.y}h${WINDOW.width}v${WINDOW.height}h${-WINDOW.width}Z`,
].join('');

const CLOCK = { cx: 1040, cy: 120, r: 30 } as const;
const WINDOW_FRAME = 16;
const WINDOW_GLINT = 5;
const MULLION = 10;

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
  readonly mugs: number;
  readonly captainLine: string;
  readonly greeting: string;
}

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
