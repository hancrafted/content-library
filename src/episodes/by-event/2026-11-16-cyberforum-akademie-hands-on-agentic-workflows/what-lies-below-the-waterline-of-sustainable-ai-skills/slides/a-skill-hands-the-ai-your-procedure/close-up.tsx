import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { PolyBubble } from '@/shared/components/core-components/poly-bubble/poly-bubble';
import { useId, type CSSProperties } from 'react';
import { CabinWalls, ProjectBrief } from './cabin-art';
import { CARD_DELAY_MS, CARD_MS, LATE_DELAY } from './card-motion';
import styles from './close-up.module.css';
import {
  bridgeWindow,
  BRIEF,
  CALLOUTS,
  CAPTAIN_X,
  CARD,
  CLOSE_UP,
  CONSOLE,
  CREW_SCALE,
  DESK_TOP,
  FLOOR_Y,
  LEADER_END,
  MANUAL,
  SAYS_SCALE,
  SHIP,
} from './close-up.pure';

/*
 * Spec Option 2a, zoomed out (feedback 3, item 7): the whole research ship at the Surface, the robot on its cable in the
 * water, and beside it a close-up of the ship's bridge, the cabin: the pilot at the console, the captain asking, the
 * project brief on the wall and one procedure card slid out of the dive manual. A lens ring on the bridge window and
 * two lines tie the close-up to the ship. The walls are lifted from the Spec (`cabin-art.tsx`); the ship, console, robot
 * and crew come from `slide-shared/`. Every place is in `close-up.pure.ts`, where the overlap test reads it.
 */

const ANCHORS = shipAnchors();
const ROBOT = robotAt('a-skill-hands-the-ai-your-procedure');
/** The robot hangs this deep on its cable from the A-frame, under the waterline. */
const ROBOT_DEPTH = 590;
const ROBOT_SCALE = 1.2;
/** Three air bubbles rising beside the cable from the robot, as in the Spec: offset from the robot, and size. */
const ROBOT_BUBBLES = [
  { dx: 26, dy: -46, size: 16 },
  { dx: 36, dy: -92, size: 11 },
  { dx: 24, dy: -128, size: 8 },
] as const;
/** The close-up's frame: the cut superstructure, then its ink edge; the corners rounded like a lens's view. */
const FRAME = { width: 14, edge: 3, radius: 24 } as const;
const LENS_PAD = 6;
/** Where the card starts, as a share of the Scene: down in the manual on the desk. */
const CARD_FROM = '6% 24%';

/** The robot on its cable from the A-frame's tip, in the water, its lamp lit: the story has it diving here. */
function RobotOnCable() {
  if (ROBOT.state !== 'in-water') return null;
  const tip = { x: SHIP.x + ANCHORS.aFrameTip.x * SHIP.scale, y: SURFACE_WATERLINE + ANCHORS.aFrameTip.y * SHIP.scale };
  return (
    <>
      <line x1={tip.x} y1={tip.y} x2={tip.x} y2={ROBOT_DEPTH} strokeWidth={3} className="stroke-muted-foreground" />
      <g transform={`translate(${tip.x} ${ROBOT_DEPTH}) scale(${ROBOT_SCALE})`}>
        <Robot state={ROBOT.state} aim="down" />
      </g>
      {ROBOT_BUBBLES.map(({ dx, dy, size }) => (
        <PolyBubble key={dy} x={tip.x + dx} y={ROBOT_DEPTH + dy} size={size} />
      ))}
    </>
  );
}

/** The ring round the ship's bridge window, and the two lines that open from it to the close-up's corners. */
function lensRing() {
  const window = bridgeWindow(ANCHORS.window);
  return {
    x: window.x - LENS_PAD,
    y: window.y - LENS_PAD,
    width: window.width + 2 * LENS_PAD,
    height: window.height + 2 * LENS_PAD,
  };
}

/** The lens lines, drawn behind the ship so they leave its hull whole. */
function LensLines() {
  const ring = lensRing();
  const right = ring.x + ring.width;
  return (
    <g data-lens-lines>
      <line
        x1={right}
        y1={ring.y}
        x2={CLOSE_UP.x}
        y2={CLOSE_UP.y}
        strokeWidth={2}
        strokeDasharray="8 6"
        data-tone="lens"
      />
      <line
        x1={right}
        y1={ring.y + ring.height}
        x2={CLOSE_UP.x}
        y2={CLOSE_UP.y + CLOSE_UP.height}
        strokeWidth={2}
        strokeDasharray="8 6"
        data-tone="lens"
      />
    </g>
  );
}

/** The lens ring on the bridge window, over the ship. */
function LensRing() {
  return <rect data-lens {...lensRing()} rx={6} strokeWidth={3} data-tone="lens" />;
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
        data-tone="card"
        strokeWidth={0.8}
      />
      <polygon
        points={`${x + half},${y + height - 2} ${x + width},${y + height} ${x + width - 2},${y} ${x + half},${y}`}
        data-tone="card"
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
      <rect x={x} y={y} width={width} height={height} rx={3} strokeWidth={2} data-tone="card" />
      <line x1={x + 8} x2={x + width - 8} y1={y + 14} y2={y + 14} strokeWidth={4} data-tone="leader" />
      {[0, 1, 2].map((row) => (
        <line
          key={row}
          x1={x + 8}
          x2={x + width - 8}
          y1={y + 28 + row * 12}
          y2={y + 28 + row * 12}
          strokeWidth={2}
          data-tone="card-rule"
        />
      ))}
    </g>
  );
}

/** The cabin: its walls, the brief, the console and manual, the pilot and the card, clipped to the close-up's frame. */
function Cabin({ clipId }: { readonly clipId: string }) {
  const seat = consoleLayout({ width: CONSOLE.width, flip: true }).seat;
  return (
    <g data-cabin clipPath={`url(#${clipId})`}>
      <CabinWalls />
      <ProjectBrief x={BRIEF.x} y={BRIEF.y} width={BRIEF.width} />
      <Console width={CONSOLE.width} flip transform={`translate(${CONSOLE.x} ${DESK_TOP}) scale(${CONSOLE.scale})`} />
      <Manual />
      <g transform={`translate(${CONSOLE.x + seat.x * CONSOLE.scale} ${FLOOR_Y}) scale(${CREW_SCALE})`}>
        <Character preset={pilot} pose="sit" flip />
      </g>
      <Travel from={CARD_FROM} duration={CARD_MS} delay={CARD_DELAY_MS}>
        <ProcedureCard />
      </Travel>
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

export interface CloseUpProps {
  /** What the captain asks for. */
  readonly request: string;
}

/** The ship, the robot in the water and the cabin close-up, as children of a Surface `ZoneScene`. */
export function CloseUp({ request }: CloseUpProps) {
  const clipId = `skill-hands-close-up-${useId()}`;
  const frame = { x: CLOSE_UP.x, y: CLOSE_UP.y, width: CLOSE_UP.width, height: CLOSE_UP.height, rx: FRAME.radius };
  return (
    <g className={styles.closeUp} style={{ '--says-scale': SAYS_SCALE } as CSSProperties}>
      <defs>
        <clipPath id={clipId}>
          <rect {...frame} />
        </clipPath>
      </defs>
      <RobotOnCable />
      <LensLines />
      <Ship transform={`translate(${SHIP.x} ${SURFACE_WATERLINE}) scale(${SHIP.scale})`} />
      <LensRing />
      <Cabin clipId={clipId} />
      <rect {...frame} strokeWidth={FRAME.width} data-tone="cut" />
      <rect {...frame} strokeWidth={FRAME.edge} data-tone="cut-edge" />
      <Leaders />
      {/*
        The captain stands inside the frame but outside its clip, over the leaders: on a phone her bubble outgrows the
        close-up, and its words stay on top.
      */}
      <g transform={`translate(${CAPTAIN_X} ${FLOOR_Y}) scale(${CREW_SCALE})`}>
        <Character preset={captain} pose="point" flip says={request} />
      </g>
    </g>
  );
}
