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
import { CARD_DELAY_MILLISECONDS, CARD_MILLISECONDS, LATE_DELAY } from './card-motion';
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

const ANCHORS = shipAnchors();
const ROBOT = robotAt('a-skill-hands-the-ai-your-procedure');
const ROBOT_DEPTH = 590;
const ROBOT_SCALE = 1.2;
const ROBOT_BUBBLES = [
  { dx: 26, dy: -46, size: 16 },
  { dx: 36, dy: -92, size: 11 },
  { dx: 24, dy: -128, size: 8 },
] as const;
const FRAME = { width: 14, edge: 3, radius: 24 } as const;
const LENS_PAD = 6;
const CARD_FROM = '6% 24%';

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

function lensRing() {
  const window = bridgeWindow(ANCHORS.window);
  return {
    x: window.x - LENS_PAD,
    y: window.y - LENS_PAD,
    width: window.width + 2 * LENS_PAD,
    height: window.height + 2 * LENS_PAD,
  };
}

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

function LensRing() {
  return <rect data-lens {...lensRing()} rx={6} strokeWidth={3} data-tone="lens" />;
}

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
      <Travel from={CARD_FROM} duration={CARD_MILLISECONDS} delay={CARD_DELAY_MILLISECONDS}>
        <ProcedureCard />
      </Travel>
    </g>
  );
}

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
  readonly request: string;
}

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
      <g transform={`translate(${CAPTAIN_X} ${FLOOR_Y}) scale(${CREW_SCALE})`}>
        <Character preset={captain} pose="point" flip says={request} />
      </g>
    </g>
  );
}
