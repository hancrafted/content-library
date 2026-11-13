import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import styles from './room.module.css';

const WIDTH = 240;
const HEIGHT = 200;
const FLOOR = 186;
const CONSOLE = { x: 96, width: 140 } as const;
/** How many card tabs stick out of the binder, and which of them are red: the never-tested ones. */
const TABS = 12;
const STAMPED: ReadonlySet<number> = new Set([1, 3, 6, 8, 10]);

/** Wall and floor facets, lit from the upper left. */
const FACETS: readonly { readonly points: string; readonly tone: string }[] = [
  { points: '0,0 120,0 60,90 0,70', tone: 'lit' },
  { points: '120,0 240,0 240,70 170,110', tone: 'mid' },
  { points: '120,0 170,110 60,90', tone: 'lit' },
  { points: `0,70 60,90 30,${FLOOR} 0,${FLOOR}`, tone: 'mid' },
  { points: `60,90 170,110 150,${FLOOR} 30,${FLOOR}`, tone: 'lit' },
  { points: `170,110 240,70 240,${FLOOR} 150,${FLOOR}`, tone: 'shade' },
  { points: `0,${FLOOR} ${WIDTH},${FLOOR} ${WIDTH},${HEIGHT} 0,${HEIGHT}`, tone: 'floor' },
];

/** The fat ring binder on the desk, bursting with thin card tabs, the never-tested ones red. */
function StuffedBinder({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-binder transform={`translate(${x} ${y})`}>
      {Array.from({ length: TABS }, (_, index) => (
        <rect
          key={index}
          data-tab={STAMPED.has(index) ? 'stamped' : 'plain'}
          x={4 + index * 4.2}
          y={-14 - (index % 3) * 3}
          width={2.6}
          height={18}
          className={STAMPED.has(index) ? styles.tabStamped : styles.tab}
        />
      ))}
      <polygon points="0,0 56,0 56,52 0,52" className={styles.binder} />
      <polygon points="0,0 22,0 18,52 0,52" className={styles.binderLit} />
      <polygon points="56,0 62,4 62,56 56,52" className={styles.binderShade} />
      <rect x={14} y={14} width={30} height={16} className={styles.paper} />
    </g>
  );
}

/**
 * The control-room corner of Slide 9: the pilot at his console with the stuffed binder on the desk. The room is drawn
 * in this Slide's folder; the pilot and the console are the shared figures (design-ADR 0025).
 */
export function ConsoleCorner({ label }: { readonly label: string }) {
  const { seat } = consoleLayout({ width: CONSOLE.width, screens: 1 });
  const deskTop = FLOOR - CONSOLE_DESK_HEIGHT;
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} className="block h-auto w-full">
      <g data-control-room className={styles.room}>
        {FACETS.map(({ points, tone }) => (
          <polygon key={points} data-tone={tone} points={points} />
        ))}
        <Console width={CONSOLE.width} screens={1} transform={`translate(${CONSOLE.x} ${deskTop})`} />
        <g transform={`translate(${CONSOLE.x + seat.x} ${FLOOR})`}>
          <Character preset={pilot} pose="sit" mood="confused" />
        </g>
        <StuffedBinder x={CONSOLE.x + 60} y={deskTop - 52} />
      </g>
    </svg>
  );
}
