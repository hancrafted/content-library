import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ControlRoom } from '@/episodes/components/slide-shared/deep-sea-expedition/control-room';
import styles from './room.module.css';

/** The corner's drawing space: narrower and taller than the comic panels' room. */
const SIZE = { width: 240, height: 200, floor: 186 } as const;
const FLOOR = SIZE.floor;
const CONSOLE = { x: 96, width: 140 } as const;
/** How many card tabs stick out of the binder, and which of them are red: the never-tested ones. */
const TABS = 12;
const STAMPED: ReadonlySet<number> = new Set([1, 3, 6, 8, 10]);

/** The fat ring binder on the desk, bursting with thin card tabs, the never-tested ones red. */
function StuffedBinder({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-binder transform={`translate(${x} ${y})`} className={styles.binderPalette}>
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
 * The control-room corner of Slide 9: the pilot at his console with the stuffed binder on the desk. The room, the
 * pilot and the console are the shared figures (design-ADR 0025); the binder is this Slide's own.
 */
export function ConsoleCorner({ label }: { readonly label: string }) {
  const { seat } = consoleLayout({ width: CONSOLE.width, screens: 1 });
  const deskTop = FLOOR - CONSOLE_DESK_HEIGHT;
  return (
    <svg viewBox={`0 0 ${SIZE.width} ${SIZE.height}`} role="img" aria-label={label} className="block h-auto w-full">
      <ControlRoom size={SIZE} time={false} clock={false}>
        <Console width={CONSOLE.width} screens={1} transform={`translate(${CONSOLE.x} ${deskTop})`} />
        <g transform={`translate(${CONSOLE.x + seat.x} ${FLOOR})`}>
          <Character preset={pilot} pose="sit" mood="confused" />
        </g>
        <StuffedBinder x={CONSOLE.x + 60} y={deskTop - 52} />
      </ControlRoom>
    </svg>
  );
}
