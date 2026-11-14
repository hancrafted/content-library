import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import type { ReactNode } from 'react';
import { NOTE_DELAY_MS, NOTE_MS } from './motion';
import styles from './where.module.css';

/*
 * The control room of Spec Option 14a, in `ZoneScene`'s 1200 by 800 space, drawn for a 2:1 box, so everything sits
 * in the lower 600 units: the captain points at the project brief on the wall, the pilot sits at the console with the
 * procedure card propped on it, and today's dive plan hangs on its clipboard. One fact, the site depth, travels once
 * from the card's dashed slot along the dashed arrow onto the dive plan. The wall, brief, card, clipboard and arrow are
 * this Slide's own; the crew and the console come from `slide-shared/` (design-ADR 0025).
 */

const FLOOR_Y = 720;
const CAPTAIN_X = 110;
const CAPTAIN_SCALE = 2;
const CONSOLE_X = 480;
const CONSOLE_WIDTH = 140;
const CONSOLE_SCALE = 1.4;
const PILOT_SCALE = 1.8;
/** Scene text is drawn at caption size and scaled with the drawing, so it reads at presenting width. */
const TEXT_SCALE = 1.15;

const BRIEF = { x: 180, y: 300, width: 180, height: 200 } as const;
const BRIEF_SLOT = { x: 196, y: 420, width: 148, height: 40 } as const;
const CARD = { x: 670, y: 380, width: 280, height: 220, tilt: -2 } as const;
const CARD_SLOT = { x: 822, y: 468, width: 100, height: 28 } as const;
const BOARD = { x: 975, y: 330, width: 210, height: 310 } as const;
/** Where the depth note rests on the dive plan. */
const NOTE = { x: 1000, y: 500, width: 150, height: 48, tilt: -3 } as const;
/** The note starts in the card's slot: its offset from the rest place, as a share of the Scene. */
const NOTE_FROM = `${((CARD_SLOT.x - NOTE.x) / 1200) * 100}% ${((CARD_SLOT.y - NOTE.y) / 800) * 100}%`;
const STEP_GAP = 32;

/** The three numbered pins, one per home, in the order of the cards beneath. */
export const PINS = [
  { n: '1', x: CARD.x + 8, y: CARD.y - 4 },
  { n: '2', x: BRIEF.x - 2, y: BRIEF.y - 4 },
  { n: '3', x: BOARD.x - 2, y: BOARD.y - 4 },
] as const;

/**
 * Where each Coding agent file pill sits over the drawing, as a share of the 2:1 box (the visible part of the Scene,
 * from y = 200 down): under the card, the brief and the clipboard.
 */
export const PILL_PLACES = [
  { x: CARD.x + CARD.width / 2, y: CARD.y + CARD.height + 18 },
  { x: BRIEF.x + BRIEF.width / 2, y: BRIEF.y + BRIEF.height + 14 },
  { x: BOARD.x + BOARD.width / 2, y: BOARD.y + BOARD.height + 14 },
].map(({ x, y }) => ({ left: `${(x / 1200) * 100}%`, top: `${((y - 200) / 600) * 100}%` }));

function Text({
  x,
  y,
  tone = 'ink',
  strong = false,
  children,
}: {
  readonly x: number;
  readonly y: number;
  readonly tone?: 'ink' | 'soft';
  readonly strong?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${TEXT_SCALE})`}>
      <text data-ink={tone} className={strong ? 'text-caption font-semibold' : 'text-caption'}>
        {children}
      </text>
    </g>
  );
}

/** The wall in faceted planes lit from the upper left, and the floor. */
function Room() {
  return (
    <g>
      <rect x={0} y={0} width={1200} height={FLOOR_Y} data-tone="room" />
      <polygon points="0,0 520,0 120,560" data-tone="room-lit" />
      <polygon points="520,0 760,0 380,420" data-tone="room-lit" />
      <polygon points={`700,${FLOOR_Y} 1200,360 1200,${FLOOR_Y}`} data-tone="room-shade" />
      <polygon points={`0,520 260,${FLOOR_Y} 0,${FLOOR_Y}`} data-tone="room-shade" />
      <rect x={0} y={FLOOR_Y} width={1200} height={800 - FLOOR_Y} data-tone="floor" />
      <polygon points={`620,${FLOOR_Y} 1200,${FLOOR_Y} 1200,800 900,800`} data-tone="floor-shade" />
    </g>
  );
}

function Rules({ x, ys, width }: { readonly x: number; readonly ys: readonly number[]; readonly width: number }) {
  return ys.map((y) => <line key={y} x1={x} x2={x + width} y1={y} y2={y} strokeWidth={3} data-tone="rule" />);
}

/** The project brief pinned to the wall, its depth slot empty. */
function WallBrief({ title, slot }: { readonly title: string; readonly slot: string }) {
  const { x, y, width, height } = BRIEF;
  return (
    <g data-wall-brief>
      <rect x={x + 6} y={y + 8} width={width} height={height} data-tone="drop" />
      <rect x={x} y={y} width={width} height={height} data-tone="paper" />
      <polygon points={`${x},${y} ${x + width * 0.7},${y} ${x},${y + height * 0.8}`} data-tone="paper-lit" />
      <circle cx={x + width - 22} cy={y + 8} r={7} data-tone="pin" />
      <Text x={x + 18} y={y + 38} strong>
        {title}
      </Text>
      <Rules x={x + 18} ys={[y + 70, y + 92]} width={width - 36} />
      <rect {...BRIEF_SLOT} rx={4} strokeWidth={2.5} data-tone="slot" />
      <Text x={BRIEF_SLOT.x + 12} y={BRIEF_SLOT.y + 26} tone="soft">
        {slot}
      </Text>
      <Rules x={x + 18} ys={[y + 172, y + 188]} width={width - 36} />
    </g>
  );
}

/** The procedure card propped on the console: its title and four steps, step 2's depth an empty dashed slot. */
function ProcedureCard({ title, steps }: { readonly title: string; readonly steps: readonly string[] }) {
  const { x, y, width, height, tilt } = CARD;
  return (
    <g data-procedure-card transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`}>
      <rect x={x + 6} y={y + 8} width={width} height={height} data-tone="drop" />
      <rect x={x} y={y} width={width} height={height} rx={4} data-tone="paper" />
      <rect x={x} y={y} width={width} height={8} data-tone="card-band" />
      <Text x={x + 20} y={y + 42} strong>
        {title}
      </Text>
      {steps.map((step, index) => (
        <Text key={step} x={x + 20} y={y + 80 + index * STEP_GAP} tone="soft">
          {step}
        </Text>
      ))}
      <rect {...CARD_SLOT} rx={4} strokeWidth={2.5} data-tone="slot" />
    </g>
  );
}

/** Today's dive plan on its clipboard: the project file the skill reads. */
function DivePlan({ title, hint }: { readonly title: string; readonly hint: string }) {
  const { x, y, width, height } = BOARD;
  return (
    <g data-dive-plan>
      <rect x={x + 6} y={y + 8} width={width} height={height} data-tone="drop" />
      <rect x={x} y={y} width={width} height={height} rx={6} data-tone="board" />
      <polygon points={`${x},${y} ${x + width},${y} ${x},${y + height * 0.6}`} data-tone="board-lit" />
      <rect x={x + 15} y={y + 20} width={width - 30} height={height - 35} data-tone="paper" />
      <rect x={x + width / 2 - 34} y={y - 12} width={68} height={26} rx={4} data-tone="clip" />
      <Text x={x + 30} y={y + 62} strong>
        {title}
      </Text>
      <Text x={x + 30} y={y + 88} tone="soft">
        {hint}
      </Text>
      <Rules x={x + 30} ys={[y + 115, y + 135]} width={width - 60} />
    </g>
  );
}

/** The depth note, at rest on the dive plan; `Travel` brings it from the card's slot. */
function DepthNote({ text }: { readonly text: string }) {
  const { x, y, width, height, tilt } = NOTE;
  return (
    <g transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`}>
      <rect x={x + 4} y={y + 6} width={width} height={height} data-tone="drop" />
      <rect x={x} y={y} width={width} height={height} rx={3} strokeWidth={3} data-tone="note" />
      <g transform={`translate(${x + 14} ${y + 32}) scale(1.4)`}>
        <text data-depth-note data-ink="ink" className="text-caption font-semibold">
          {text}
        </text>
      </g>
    </g>
  );
}

/** The dashed arrow the note travels along, from the card's slot to the dive plan. */
function MovePath() {
  const from = { x: CARD_SLOT.x + CARD_SLOT.width, y: CARD_SLOT.y + 8 };
  const to = { x: NOTE.x + 4, y: NOTE.y + 6 };
  return (
    <g data-move-path>
      <circle cx={from.x} cy={from.y} r={6} data-tone="arrow-head" />
      <path
        d={`M${from.x} ${from.y} C${from.x + 40} ${from.y - 140} ${to.x - 30} ${to.y - 120} ${to.x} ${to.y}`}
        strokeWidth={3.5}
        strokeDasharray="10 8"
        data-tone="arrow"
      />
      <polygon points={`${to.x},${to.y} ${to.x - 18},${to.y - 6} ${to.x - 6},${to.y - 20}`} data-tone="arrow-head" />
    </g>
  );
}

function Pins() {
  return PINS.map(({ n, x, y }) => (
    <g key={n} transform={`translate(${x} ${y})`}>
      <circle r={22} data-tone="pin-dot" />
      <g transform={`scale(${TEXT_SCALE})`}>
        <text data-pin y={5} textAnchor="middle" data-ink="pin" className="text-caption font-semibold">
          {n}
        </text>
      </g>
    </g>
  ));
}

export interface ControlRoomProps {
  readonly brief: { readonly title: string; readonly slot: string };
  readonly card: { readonly title: string; readonly steps: readonly string[] };
  readonly plan: { readonly title: string; readonly hint: string };
  readonly note: string;
}

/** The whole room, as children of a `ZoneScene`. */
export function ControlRoom({ brief, card, plan, note }: ControlRoomProps) {
  const seat = consoleLayout({ width: CONSOLE_WIDTH }).seat;
  const deskTop = FLOOR_Y - CONSOLE_DESK_HEIGHT * CONSOLE_SCALE;
  return (
    <g className={styles.room}>
      <Room />
      <WallBrief title={brief.title} slot={brief.slot} />
      <g transform={`translate(${CAPTAIN_X} ${FLOOR_Y}) scale(${CAPTAIN_SCALE})`}>
        <Character preset={captain} pose="point" />
      </g>
      <Console width={CONSOLE_WIDTH} transform={`translate(${CONSOLE_X} ${deskTop}) scale(${CONSOLE_SCALE})`} />
      <g transform={`translate(${CONSOLE_X + seat.x * CONSOLE_SCALE} ${FLOOR_Y}) scale(${PILOT_SCALE})`}>
        <Character preset={pilot} pose="sit" />
      </g>
      <ProcedureCard title={card.title} steps={card.steps} />
      <DivePlan title={plan.title} hint={plan.hint} />
      <MovePath />
      <Travel from={NOTE_FROM} duration={NOTE_MS} delay={NOTE_DELAY_MS}>
        <DepthNote text={note} />
      </Travel>
      <Pins />
    </g>
  );
}
