import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { NOTE_DELAY_MS, NOTE_MS } from './motion';
import { Clipboard, Rules, Sheet, Text, TEXT_SCALE } from './papers';
import { FLOOR_Y, RoomArt, VIEW_TOP } from './room-art';
import styles from './where.module.css';

/*
 * The control room of Spec Option 14a, in `ZoneScene`'s 1200 by 800 space, drawn for a 2:1 box, so everything sits
 * in the lower 600 units: the captain points at the project brief on the wall, the pilot sits at the long console with
 * the procedure card leaning on it, and today's dive plan hangs on its wooden clipboard. One fact, the site depth,
 * travels once from the card's dashed slot along the dashed arrow onto the dive plan. The room (`room-art.tsx`), brief,
 * card, clipboard and arrow are this Slide's own, lifted from the Option (feedback 3, decision 46); the crew and the
 * console come from `slide-shared/` (design-ADR 0025).
 */

const CAPTAIN_X = 110;
const CAPTAIN_SCALE = 2;
const CONSOLE_X = 470;
/** As wide as the Option's long console, so the procedure card can lean on its right half. */
const CONSOLE_WIDTH = 230;
const CONSOLE_SCALE = 1.4;
const PILOT_SCALE = 1.8;
const DESK_TOP = FLOOR_Y - CONSOLE_DESK_HEIGHT * CONSOLE_SCALE;

const BRIEF = { x: 180, y: 300, width: 190, height: 210, tilt: -1.2 } as const;
const BRIEF_SLOT = { x: 196, y: 420, width: 148, height: 40 } as const;
/** The card leans on the console's right half, its foot on the desk, as in the Option. */
const CARD = { x: 630, y: DESK_TOP - 224, width: 280, height: 220, tilt: -2 } as const;
const CARD_SLOT = { x: CARD.x + 152, y: CARD.y + 88, width: 100, height: 28 } as const;
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
].map(({ x, y }) => ({ left: `${(x / 1200) * 100}%`, top: `${((y - VIEW_TOP) / (800 - VIEW_TOP)) * 100}%` }));

/** The project brief pinned to the wall, a touch askew, its depth slot empty. */
function WallBrief({ title, slot }: { readonly title: string; readonly slot: string }) {
  const { x, y, width, height, tilt } = BRIEF;
  const pin = x + width * 0.5;
  return (
    <g data-wall-brief transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`}>
      <Sheet x={x} y={y} width={width} height={height} />
      <polygon
        points={`${pin - 7},${y - 6} ${pin + 7},${y - 6} ${pin + 5},${y + 8} ${pin - 5},${y + 8}`}
        data-tone="pin"
      />
      <polygon points={`${pin - 7},${y - 6} ${pin},${y - 6} ${pin - 5},${y + 8}`} data-tone="glint" />
      <Text x={x + 18} y={y + 38} strong>
        {title}
      </Text>
      <Rules x={x + 18} ys={[y + 66, y + 84, y + 102]} width={width - 56} />
      <rect {...BRIEF_SLOT} rx={4} strokeWidth={2.5} data-tone="slot" />
      <Text x={BRIEF_SLOT.x + 12} y={BRIEF_SLOT.y + 26} tone="soft">
        {slot}
      </Text>
      <Rules x={x + 18} ys={[y + 180, y + 196]} width={width - 70} />
    </g>
  );
}

/** The procedure card leaning on the console: its skill band, title and four steps, step 2's depth an empty dashed slot. */
function ProcedureCard({ title, steps }: { readonly title: string; readonly steps: readonly string[] }) {
  const { x, y, width, height, tilt } = CARD;
  return (
    <g data-procedure-card transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`}>
      <Sheet x={x} y={y} width={width} height={height} />
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

/** Today's dive plan on its wooden clipboard: the project file the skill reads. */
function DivePlan({ title, hint }: { readonly title: string; readonly hint: string }) {
  const { x, y, width } = BOARD;
  return (
    <g data-dive-plan>
      <Clipboard {...BOARD} />
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

/** The depth note, at rest on the dive plan, its lower edge in shade and its corner curled; `Travel` brings it from the card's slot. */
function DepthNote({ text }: { readonly text: string }) {
  const { x, y, width, height, tilt } = NOTE;
  const right = x + width;
  const bottom = y + height;
  return (
    <g transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`}>
      <rect x={x + 4} y={y + 6} width={width} height={height} data-tone="drop" />
      <polygon points={`${x},${y} ${right},${y} ${x},${bottom}`} data-tone="note" />
      <polygon
        points={`${right},${y} ${right},${bottom - 14} ${right - 14},${bottom} ${x},${bottom}`}
        data-tone="note-shade"
      />
      <polygon
        points={`${right},${bottom - 14} ${right - 14},${bottom} ${right - 12},${bottom - 12}`}
        data-tone="paper-lit"
      />
      <rect x={x} y={y} width={width} height={height} rx={2} strokeWidth={3} data-tone="note-edge" />
      <g transform={`translate(${x + 14} ${y + 32}) scale(1.4)`}>
        <text data-depth-note data-ink="ink" className="text-caption font-semibold">
          {text}
        </text>
      </g>
    </g>
  );
}

/** The dashed arrow the note travels along, from the card's slot to the dive plan, ending in an open chevron. */
function MovePath() {
  const from = { x: CARD_SLOT.x + CARD_SLOT.width, y: CARD_SLOT.y + 8 };
  const to = { x: NOTE.x - 8, y: NOTE.y + 10 };
  return (
    <g data-move-path>
      <circle cx={from.x} cy={from.y} r={6} data-tone="arrow-head" />
      <path
        d={`M${from.x} ${from.y} C${from.x + 40} ${from.y - 140} ${to.x - 30} ${to.y - 120} ${to.x} ${to.y}`}
        strokeWidth={3.5}
        strokeDasharray="10 8"
        strokeLinecap="round"
        data-tone="arrow"
      />
      <path
        d={`M${to.x - 19} ${to.y - 16} L${to.x} ${to.y} L${to.x - 23} ${to.y + 6}`}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-tone="arrow"
      />
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
  return (
    <g className={styles.room}>
      <RoomArt />
      <WallBrief title={brief.title} slot={brief.slot} />
      <g transform={`translate(${CAPTAIN_X} ${FLOOR_Y}) scale(${CAPTAIN_SCALE})`}>
        <Character preset={captain} pose="point" />
      </g>
      <Console width={CONSOLE_WIDTH} transform={`translate(${CONSOLE_X} ${DESK_TOP}) scale(${CONSOLE_SCALE})`} />
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
