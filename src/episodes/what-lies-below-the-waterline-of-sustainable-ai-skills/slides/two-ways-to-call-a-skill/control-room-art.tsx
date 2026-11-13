import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ControlRoom } from './room';
import styles from './slide.module.css';

/** The Scene shows its lower part, from here to the floor: the box is twice as wide as tall. */
const VIEW_TOP = 200;

/** Where an overlay word sits over the drawing, in the Scene's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({ left: `${x / 12}%`, top: `${((y - VIEW_TOP) / 600) * 100}%` });

/** A width in the Scene's units, as a percentage of the box. */
export const wide = (width: number) => `${width / 12}%`;

const FLOOR = 720;
const BULKHEAD = { x: 584, width: 24 } as const;
const CONSOLE_WIDTH = 110;
const CONSOLE_SCALE = 1.8;
/** Where each console's desk starts: the pilot sits to its left, clear of the bulkhead on the right. */
const LEFT_CONSOLE = 360;
const RIGHT_CONSOLE = 740;
/** The pulled card above the left console, where the words go. */
export const PULLED = { x: 360, y: 370, width: 190, height: 96 } as const;
/** The index board on the right wall; its entries are the overlay's. */
export const INDEX = { x: 950, y: 230, width: 230, height: 460 } as const;
/** The task note the pilot reads on the right. */
export const TASK = { x: 640, y: 250 } as const;

/** The manual on the console, a binder with card tabs; `(0, 0)` is its bottom-left corner. */
function Manual({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-manual transform={`translate(${x} ${y})`}>
      <rect x={0} y={-70} width={44} height={70} className="fill-(--book)" />
      <rect x={0} y={-70} width={10} height={70} className="fill-(--book-lit)" />
      <rect x={44} y={-60} width={6} height={10} className="fill-(--tab-a)" />
      <rect x={44} y={-44} width={6} height={10} className="fill-(--tab-b)" />
      <rect x={44} y={-28} width={6} height={10} className="fill-(--tab-c)" />
    </g>
  );
}

/** The pilot seated at a console whose desk starts at `x`. */
function PilotAtConsole({ x }: { readonly x: number }) {
  const { seat } = consoleLayout({ width: CONSOLE_WIDTH });
  return (
    <g transform={`translate(${x} ${FLOOR - 70 * CONSOLE_SCALE}) scale(${CONSOLE_SCALE})`}>
      <Console width={CONSOLE_WIDTH} />
      <g transform={`translate(${seat.x} ${seat.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
    </g>
  );
}

/** A sheet of paper with its drop shadow; `tab` adds the coloured strip along its top edge. */
function Sheet({
  x,
  y,
  width,
  height,
  tab = false,
}: {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tab?: boolean;
}) {
  return (
    <>
      <rect x={x + 6} y={y + 6} width={width} height={height} className="fill-(--paper-shade)" />
      <rect x={x} y={y} width={width} height={height} className="fill-(--paper)" />
      {tab && <rect x={x} y={y} width={width} height={8} className="fill-(--tab-a)" />}
    </>
  );
}

/** Left, called by name: you, the captain, ask, and the pilot pulls that one card out of the manual. */
function ByName() {
  return (
    <>
      <g transform={`translate(100 ${FLOOR}) scale(2.4)`}>
        <Character preset={captain} pose="point" />
      </g>
      <PilotAtConsole x={LEFT_CONSOLE} />
      <Manual x={LEFT_CONSOLE + CONSOLE_WIDTH * CONSOLE_SCALE - 60} y={FLOOR - 70 * CONSOLE_SCALE - 2} />
      <g data-pulled-card transform={`rotate(-4 ${PULLED.x} ${PULLED.y})`}>
        <Sheet {...PULLED} tab />
      </g>
      <path d="M330 300 Q370 320 400 362" strokeWidth={3} strokeDasharray="8 8" className="fill-none stroke-(--scan)" />
    </>
  );
}

/** Right, picked from its description: the pilot reads the index board, and the scan line runs to the matching line. */
function ByDescription() {
  return (
    <>
      <PilotAtConsole x={RIGHT_CONSOLE} />
      <g data-index-paper>
        <Sheet {...INDEX} />
      </g>
      <path
        data-motion="scan"
        d={`M${TASK.x + 200} ${TASK.y + 40} Q${INDEX.x - 20} ${INDEX.y + 160} ${INDEX.x + 4} ${INDEX.y + 110}`}
        strokeWidth={3}
        strokeDasharray="8 8"
        className={`${styles.scan} fill-none stroke-(--scan)`}
      />
    </>
  );
}

/**
 * The control room split by a bulkhead, inside `ZoneScene`: called by name on the left, picked from its description on
 * the right, where nobody names a skill.
 */
export function ControlRoomArt() {
  return (
    <>
      <ControlRoom floor={FLOOR} />
      <rect x={BULKHEAD.x} y={0} width={BULKHEAD.width} height={800} className="fill-(--bulk)" />
      <ByName />
      <ByDescription />
    </>
  );
}
