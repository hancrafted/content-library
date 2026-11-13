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
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { CALLOUTS, type CalloutSlug } from './callouts';
import { CARD_DELAY_MS, CARD_MS, LATE_DELAY } from './card-motion';
import styles from './cutaway.module.css';

/*
 * The cutaway of Spec Option 2a, in `ZoneScene`'s 1200 by 800 space: the research ship at the Surface, its control
 * room cut open over the deck house, the pilot at the console, the captain asking, the project brief on the wall and
 * one procedure card slid out of the dive manual; the robot hangs on its cable below the waterline. The room, manual,
 * card, brief and leader lines are this Slide's own; the ship, console, robot and crew come from `slide-shared/`.
 */

const SHIP_X = 640;
const SHIP_SCALE = 2.8;
/** The cut-open room over the deck house, its floor on the deck. */
const ROOM = { x: 556, y: 104, width: 482, height: 201 } as const;
const FLOOR_Y = ROOM.y + ROOM.height;
const FLOOR_DEPTH = 10;
const CREW_SCALE = 1.8;
const CONSOLE_WIDTH = 110;
const CONSOLE_SCALE = 0.85;
const CONSOLE_X = 575;
const CAPTAIN_X = 880;
/** The robot hangs this deep on its cable from the A-frame, below the waterline. */
const ROBOT_DEPTH = 560;
const ROBOT_SCALE = 1.4;

/** The project brief on the wall, the open manual on the desk, the card at rest over the console. */
const BRIEF = { x: 930, y: 140, width: 86, height: 90 } as const;
const DESK_TOP = FLOOR_Y - CONSOLE_DESK_HEIGHT * CONSOLE_SCALE;
const MANUAL = { x: 585, y: DESK_TOP - 8, width: 52, height: 8 } as const;
const CARD = { x: 584, y: 120, width: 76, height: 84, tilt: -6 } as const;
/** Where the card starts, as a share of the Scene: down in the manual. */
const CARD_FROM = '-1.5% 9%';

const ANCHORS = shipAnchors();

/** Where each callout's leader ends: on the card, on the manual's index, on the brief. */
const LEADER_END: Record<CalloutSlug, readonly [number, number]> = {
  skill: [CARD.x + CARD.width / 2, CARD.y],
  description: [MANUAL.x + MANUAL.width / 4, MANUAL.y],
  project: [BRIEF.x + BRIEF.width / 2, BRIEF.y],
};

function Room() {
  const { x, y, width, height } = ROOM;
  return (
    <g data-cutaway-room>
      <rect x={x} y={y} width={width} height={height} data-tone="room" />
      <polygon points={`${x},${y} ${x + 200},${y} ${x},${y + 140}`} data-tone="room-lit" />
      <polygon
        points={`${x + width},${y + 40} ${x + width},${FLOOR_Y} ${x + width - 180},${FLOOR_Y}`}
        data-tone="room-shade"
      />
      <rect x={x} y={FLOOR_Y - FLOOR_DEPTH} width={width} height={FLOOR_DEPTH} data-tone="floor" />
      <rect x={x} y={y} width={width} height={height} strokeWidth={6} data-tone="cut" />
    </g>
  );
}

/** Ruled lines across a sheet, as many as `rows`, inset from its edges. */
function Rules({ x, y, width, rows, gap }: { x: number; y: number; width: number; rows: number; gap: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <line
      key={index}
      x1={x}
      x2={x + width}
      y1={y + index * gap}
      y2={y + index * gap}
      strokeWidth={2}
      data-tone="rule"
    />
  ));
}

/** The dive manual, open at its index on the desk: one index line per skill. */
function Manual() {
  const { x, y, width, height } = MANUAL;
  const half = width / 2;
  return (
    <g data-dive-manual>
      <rect x={x - 2} y={y + 2} width={width + 4} height={height} data-tone="cover" />
      <polygon
        points={`${x},${y + height} ${x + half},${y + height - 2} ${x + half},${y} ${x + 2},${y}`}
        data-tone="paper"
      />
      <polygon
        points={`${x + half},${y + height - 2} ${x + width},${y + height} ${x + width - 2},${y} ${x + half},${y}`}
        data-tone="paper"
        strokeWidth={0.8}
      />
    </g>
  );
}

/** The procedure card, out of the manual and tilted over the console: a title and three steps. */
function ProcedureCard() {
  const { x, y, width, height, tilt } = CARD;
  return (
    <g data-procedure-card transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`}>
      <rect x={x} y={y} width={width} height={height} rx={3} strokeWidth={2} data-tone="paper" />
      <line x1={x + 8} x2={x + width - 8} y1={y + 14} y2={y + 14} strokeWidth={4} data-tone="leader" />
      <Rules x={x + 8} y={y + 28} width={width - 16} rows={3} gap={12} />
    </g>
  );
}

/** The project brief pinned to the wall: a title and its lines. */
function ProjectBrief() {
  const { x, y, width, height } = BRIEF;
  return (
    <g data-project-brief>
      <rect x={x} y={y} width={width} height={height} strokeWidth={3} data-tone="paper" />
      <line x1={x + 10} x2={x + width - 10} y1={y + 16} y2={y + 16} strokeWidth={4} data-tone="leader" />
      <Rules x={x + 10} y={y + 32} width={width - 20} rows={4} gap={12} />
    </g>
  );
}

/** The leader lines from each callout down to what it names; the skill's in `primary`, appearing last. */
function Leaders() {
  return CALLOUTS.map(({ slug, at }) => {
    const [x2, y2] = LEADER_END[slug];
    const focal = slug === 'skill';
    return (
      <line
        key={slug}
        x1={at.x}
        y1={at.y}
        x2={x2}
        y2={y2}
        strokeWidth={focal ? 4 : 2.5}
        data-tone={focal ? 'leader-focal' : 'leader'}
        data-motion={focal ? 'late' : undefined}
        className={focal ? styles.late : undefined}
        style={focal ? LATE_DELAY : undefined}
      />
    );
  });
}

/** The robot on its cable from the A-frame's tip, below the waterline, its lamp on the seabed. */
function RobotOnCable() {
  const tip = {
    x: SHIP_X + ANCHORS.aFrameTip.x * SHIP_SCALE,
    y: SURFACE_WATERLINE + ANCHORS.aFrameTip.y * SHIP_SCALE,
  };
  return (
    <>
      <line x1={tip.x} y1={tip.y} x2={tip.x} y2={ROBOT_DEPTH} strokeWidth={3} className="stroke-muted-foreground" />
      <g transform={`translate(${tip.x} ${ROBOT_DEPTH}) scale(${ROBOT_SCALE})`}>
        <Robot aim="down" />
      </g>
    </>
  );
}

export interface CutawayProps {
  /** What the captain asks for. */
  readonly request: string;
}

/** The whole cutaway, as children of a Surface `ZoneScene`. */
export function Cutaway({ request }: CutawayProps) {
  const seat = consoleLayout({ width: CONSOLE_WIDTH, flip: true }).seat;
  return (
    <g className={styles.cutaway}>
      <RobotOnCable />
      <Ship transform={`translate(${SHIP_X} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`} />
      <Room />
      <ProjectBrief />
      <Console width={CONSOLE_WIDTH} flip transform={`translate(${CONSOLE_X} ${DESK_TOP}) scale(${CONSOLE_SCALE})`} />
      <Manual />
      <g transform={`translate(${CONSOLE_X + seat.x * CONSOLE_SCALE} ${FLOOR_Y}) scale(${CREW_SCALE})`}>
        <Character preset={pilot} pose="sit" flip />
      </g>
      <g transform={`translate(${CAPTAIN_X} ${FLOOR_Y}) scale(${CREW_SCALE})`}>
        <Character preset={captain} pose="point" flip says={request} />
      </g>
      <Travel from={CARD_FROM} duration={CARD_MS} delay={CARD_DELAY_MS}>
        <ProcedureCard />
      </Travel>
      <Leaders />
    </g>
  );
}
