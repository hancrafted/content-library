import { Character, type Preset } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import styles from './slide.module.css';

/** The room's floor line in the Scene's 1200 by 800 space; the Slide's 2:1 art box shows its lower 600 units. */
const FLOOR = 720;
/** The porthole onto the Midnight water, cut through the wall so the zone's own sea shows. */
const PORTHOLE = { x: 1120, y: 280, r: 54 };
/** The fleet manual's board on its lectern; the page itself is HTML over it, so its words read at any width. */
export const BOARD = { x: 330, y: 392, width: 370, height: 262 };
/** Where each reader sits: the console's floor line, one row per AI. */
export const READER_ROWS = [430, 556, 682] as const;
const READER_X = 790;
const READER_SCALE = 1;
const CONSOLE_WIDTH = 110;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
const CAPTAIN_SCALE = 3.1;

/** You, the captain, with your own notebook in hand: the cast's captain carrying the clipboard prop. */
const captainWithNotebook: Preset = { ...captain, prop: 'clipboard' };

/** The wall with the porthole cut out, a few facets lit from the upper left, and the faceted floor. */
function Walls() {
  const { x, y, r } = PORTHOLE;
  return (
    <g aria-hidden className={styles.room}>
      <path
        data-tone="room"
        fillRule="evenodd"
        d={`M0 0H1200V${FLOOR}H0Z M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`}
      />
      <polygon data-tone="room-lit" points={`0,200 260,200 120,520 0,${FLOOR}`} />
      <polygon data-tone="room-shade" points={`260,200 520,200 380,${FLOOR} 120,520`} />
      <polygon data-tone="room-lit" points={`760,${FLOOR} 900,200 1040,200 1000,${FLOOR}`} />
      <circle data-tone="frame" cx={x} cy={y} r={r + 9} fill="none" strokeWidth={14} />
      <polygon data-tone="floor-lit" points={`0,${FLOOR} 460,${FLOOR} 340,800 0,800`} />
      <polygon data-tone="floor" points={`460,${FLOOR} 920,${FLOOR} 860,800 340,800`} />
      <polygon data-tone="floor-shade" points={`920,${FLOOR} 1200,${FLOOR} 1200,800 860,800`} />
    </g>
  );
}

/** The institute's shelf of manuals over the lectern: the library this skill joins. */
function Shelf() {
  const spines = ['a', 'b', 'c', 'b', 'a', 'c', 'a', 'b', 'c'] as const;
  return (
    <g aria-hidden className={styles.room}>
      {spines.map((tone, index) => (
        <rect
          key={index}
          data-tone={`spine-${tone}`}
          x={410 + index * 30}
          y={index % 3 === 1 ? 286 : 272}
          width={26}
          height={index % 3 === 1 ? 76 : 90}
        />
      ))}
      <rect data-tone="shelf" x={390} y={362} width={300} height={12} />
      <rect data-tone="shelf-shade" x={390} y={374} width={300} height={5} />
    </g>
  );
}

/** The fleet manual open on its lectern: green covers, the page left blank for the HTML that names its contents. */
function Lectern() {
  const { x, y, width, height } = BOARD;
  return (
    <g aria-hidden className={styles.room}>
      <polygon
        data-tone="lectern"
        points={`${x + 150},${y + height} ${x + 234},${y + height} ${x + 222},${FLOOR} ${x + 162},${FLOOR}`}
      />
      <rect data-tone="book" x={x} y={y} width={width} height={height} rx={6} />
      <rect data-tone="book-lit" x={x} y={y} width={width / 2} height={height} rx={6} />
      <rect data-tone="page" x={x + 18} y={y + 14} width={width - 36} height={height - 28} rx={3} />
    </g>
  );
}

/** One AI at its console: the pilot, seated, its screens running the shared version. */
function Reader({ row }: { readonly row: number }) {
  return (
    <g transform={`translate(${READER_X} ${row}) scale(${READER_SCALE})`}>
      <g transform="translate(40 -70)">
        <Console width={CONSOLE_WIDTH} />
        <g transform={`translate(${SEAT.x} ${SEAT.y})`}>
          <Character preset={pilot} pose="sit" />
        </g>
      </g>
    </g>
  );
}

/** The dotted lines from the manual's page to each reader, drawn in once after the control block is stamped. */
function ReachLines() {
  const from = { x: BOARD.x + BOARD.width, y: BOARD.y + BOARD.height / 2 };
  return (
    <g aria-hidden data-motion="reach" className={styles.reach}>
      {READER_ROWS.map((row) => {
        const to = { x: READER_X - 4, y: row - 80 };
        return (
          <g key={row}>
            <path
              d={`M ${from.x} ${from.y} C ${from.x + 60} ${from.y}, ${to.x - 60} ${to.y}, ${to.x} ${to.y}`}
              strokeWidth={4}
              strokeDasharray="2 10"
              strokeLinecap="round"
              className={styles.reachLine}
            />
            <circle cx={to.x} cy={to.y} r={7} className={styles.reachDot} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * The control room at Midnight (Option 20b): you at the left with your notebook, the fleet manual on its lectern under
 * the institute's shelf, and three AIs at their consoles, each reached from the manual's page. Figures are the shared
 * cast (design-ADR 0025); walls, shelf, lectern and reach lines are this Slide's own scenery.
 */
export function ControlRoom() {
  return (
    <g>
      <Walls />
      <Shelf />
      <Lectern />
      <g transform={`translate(150 ${FLOOR}) scale(${CAPTAIN_SCALE})`}>
        <Character preset={captainWithNotebook} pose="hold" />
      </g>
      <ReachLines />
      {READER_ROWS.map((row) => (
        <Reader key={row} row={row} />
      ))}
    </g>
  );
}
