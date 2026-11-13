import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ControlRoom } from './room';
import styles from './slide.module.css';

/** The Scene shows its lower part, from here to the floor: the box is twice as wide as tall. */
export const VIEW_TOP = 200;
const SCENE_W = 1200;
const SCENE_H = 800;

/** Where an overlay word sits over the drawing, in the Scene's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_W) * 100}%`,
  top: `${((y - VIEW_TOP) / (SCENE_H - VIEW_TOP)) * 100}%`,
});

const SHELF = { x: 60, y: 250, width: 330, rows: 3, perRow: 9 } as const;
const ROW_HEIGHT = 108;
const CONSOLE = { x: 610, y: 580, width: 130, scale: 2 } as const;
export const PROPPED = { x: 660, y: 420, width: 230, height: 152 } as const;
const TABLE = { x: 920, y: 600, width: 220 } as const;
const LAMP_X = 1030;
const TABS = ['fill-(--tab-a)', 'fill-(--tab-b)', 'fill-(--tab-c)'] as const;

/** One shelf card standing with its tab in view. */
function ShelfCard({
  x,
  top,
  width,
  tab,
}: {
  readonly x: number;
  readonly top: number;
  readonly width: number;
  readonly tab: string;
}) {
  return (
    <g>
      <rect x={x} y={top + 18} width={width - 5} height={ROW_HEIGHT - 30} className="fill-(--paper)" />
      <rect x={x + width - 9} y={top + 18} width={4} height={ROW_HEIGHT - 30} className="fill-(--paper-shade)" />
      <rect x={x + 3} y={top + 8} width={width - 14} height={12} className={tab} />
    </g>
  );
}

/** One row of the shelf, its cards side by side. */
function ShelfRow({ row }: { readonly row: number }) {
  const top = SHELF.y + 12 + row * ROW_HEIGHT;
  const cardWidth = (SHELF.width - 40) / SHELF.perRow;
  return (
    <g>
      <rect
        x={SHELF.x + 10}
        y={top}
        width={SHELF.width - 20}
        height={ROW_HEIGHT - 12}
        className="fill-(--wood-shade)"
      />
      {Array.from({ length: SHELF.perRow }, (_, card) => (
        <ShelfCard
          key={card}
          x={SHELF.x + 20 + card * cardWidth}
          top={top}
          width={cardWidth}
          tab={TABS[(card + row) % 3] ?? TABS[0]}
        />
      ))}
    </g>
  );
}

/** The manual on its wall shelf, every card standing with its tab in view: the skill index. */
function ManualShelf() {
  return (
    <g data-manual-shelf>
      <rect
        x={SHELF.x}
        y={SHELF.y}
        width={SHELF.width}
        height={SHELF.rows * ROW_HEIGHT + 12}
        className="fill-(--wood)"
      />
      {Array.from({ length: SHELF.rows }, (_, row) => (
        <ShelfRow key={row} row={row} />
      ))}
    </g>
  );
}

/** The one card the pilot pulled, propped up on the console; its words are the overlay's. */
function PulledCard() {
  const { x, y, width, height } = PROPPED;
  return (
    <g data-pulled-card>
      <rect x={x + 6} y={y + 6} width={width} height={height} className="fill-(--paper-shade)" />
      <rect x={x} y={y} width={width} height={height} className="fill-(--paper)" />
      <rect x={x} y={y} width={width} height={8} className="fill-(--tab-a)" />
    </g>
  );
}

/** The three extras slid out of the sleeve onto the table: the guide, the label template, the arm preset. */
function TableExtras() {
  const { x, y } = TABLE;
  return (
    <g data-table-extras>
      <polygon
        points={`${x + 30},${y} ${x + 30},${y - 60} ${x + 76},${y - 66} ${x + 76},${y}`}
        className="fill-(--guide)"
      />
      <polygon
        points={`${x + 92},${y} ${x + 92},${y - 38} ${x + 140},${y - 38} ${x + 150},${y - 19} ${x + 140},${y}`}
        className="fill-(--paper)"
      />
      <polygon
        points={`${x + 160},${y} ${x + 172},${y - 34} ${x + 180},${y - 30} ${x + 170},${y}`}
        className="fill-(--preset-arm)"
      />
      <polygon
        points={`${x + 172},${y - 34} ${x + 196},${y - 50} ${x + 199},${y - 44} ${x + 178},${y - 28}`}
        className="fill-(--preset-arm)"
      />
    </g>
  );
}

/** The side table with the sleeve on it and the three extras slid out, under the ceiling lamp. */
function SideTable() {
  const { x, y, width } = TABLE;
  return (
    <g data-side-table>
      <rect x={x} y={y} width={width} height={14} className="fill-(--wood)" />
      <rect x={x + 14} y={y + 14} width={12} height={720 - y - 14} className="fill-(--wood-shade)" />
      <rect x={x + width - 26} y={y + 14} width={12} height={720 - y - 14} className="fill-(--wood-shade)" />
      <rect
        x={x + 18}
        y={y - 70}
        width={width - 36}
        height={70}
        className="fill-(--sleeve) stroke-(--sleeve-edge)"
        strokeWidth={3}
      />
      <TableExtras />
    </g>
  );
}

/** The ceiling lamp on its cord; its light switches on over the sleeve, the third and last level. */
function CeilingLamp() {
  return (
    <g data-ceiling-lamp>
      <line x1={LAMP_X} y1={0} x2={LAMP_X} y2={310} strokeWidth={4} className="stroke-(--frame)" />
      <polygon
        data-motion="lamp-on"
        points={`${LAMP_X - 34},336 ${LAMP_X + 34},336 ${TABLE.x + TABLE.width},${TABLE.y} ${TABLE.x},${TABLE.y}`}
        className={`${styles.beam} fill-(--beam)`}
      />
      <polygon
        points={`${LAMP_X - 14},310 ${LAMP_X + 14},310 ${LAMP_X + 38},338 ${LAMP_X - 38},338`}
        className="fill-(--lamp-shade)"
      />
      <ellipse cx={LAMP_X} cy={340} rx={18} ry={6} className="fill-(--lamp)" />
    </g>
  );
}

/** A halo of light over one level; it passes as the light crosses the room. */
function Halo({
  at: level,
  ...ellipse
}: {
  readonly at: 'index' | 'card';
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}) {
  return <ellipse data-halo={level} data-motion="halo" {...ellipse} className={`${styles.halo} fill-(--halo)`} />;
}

/** The pilot seated at the console. */
function PilotAtConsole() {
  const { seat } = consoleLayout({ width: CONSOLE.width });
  return (
    <g transform={`translate(${CONSOLE.x} ${CONSOLE.y}) scale(${CONSOLE.scale})`}>
      <Console width={CONSOLE.width} />
      <g transform={`translate(${seat.x} ${seat.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
    </g>
  );
}

/**
 * The control room from the side, read left to right as the three loading levels: the manual's index on the wall,
 * the pilot at the console with one card propped up, the sleeve on the side table under the lamp. A window shows the
 * Surface outside. Halos mark the light's way across the room.
 */
export function ControlRoomArt() {
  return (
    <>
      <ControlRoom floor={720} openings={[{ x: 440, y: 260, width: 280, height: 170, framed: true }]} />
      <Halo at="index" cx={225} cy={420} rx={220} ry={240} />
      <ManualShelf />
      <Halo at="card" cx={775} cy={495} rx={150} ry={110} />
      <PilotAtConsole />
      <PulledCard />
      <CeilingLamp />
      <SideTable />
    </>
  );
}
