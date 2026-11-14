import type { Mood } from '@/episodes/components/slide-shared/character/actor';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ControlRoom } from '@/episodes/components/slide-shared/deep-sea-expedition/control-room';
import { ROOM } from '@/episodes/components/slide-shared/deep-sea-expedition/control-room.pure';
import styles from './slide.module.css';

export type Day = 1 | 2 | 3;

const FLOOR = ROOM.floor;
const CONSOLE = { x: 200, width: 92 } as const;
const CAPTAIN_X = 50;
/** The figures a little under their drawn size, so a bubble fits over each head in the room. */
const FIGURE_SCALE = 0.85;
/** The pilot's look each morning: puzzled, then working it through, then satisfied. */
const PILOT_MOOD: Record<Day, Mood> = { 1: 'confused', 2: 'thinking', 3: 'happy' };
/** On day 3 the captain holds the written card out: the clipboard is the card. */
const CAPTAIN_WITH_CARD = { ...captain, prop: 'clipboard' } as const;

export interface MorningSceneProps {
  readonly day: Day;
  /** The picture's words for assistive tech. */
  readonly label: string;
  /** What the captain and the pilot say; left out, the picture shows no speech. */
  readonly says?: { readonly captain: string; readonly pilot: string };
}

/**
 * One morning in the control room, the comic's panel picture: the captain explains, the pilot at his console listens.
 * Only the mug count and the captain's pose change from day to day; on day 3 he holds the written card out. The room,
 * the people and the console are the shared figures (design-ADR 0025).
 */
export function MorningScene({ day, label, says }: MorningSceneProps) {
  const { seat } = consoleLayout({ width: CONSOLE.width, mugs: day });
  const deskTop = FLOOR - CONSOLE_DESK_HEIGHT;
  return (
    <svg
      viewBox={`0 0 ${ROOM.width} ${ROOM.height}`}
      role="img"
      aria-label={label}
      data-morning={day}
      className={`block h-auto w-full ${styles.morning}`}
    >
      <ControlRoom>
        <Console width={CONSOLE.width} mugs={day} transform={`translate(${CONSOLE.x} ${deskTop})`} />
        <g transform={`translate(${CONSOLE.x + seat.x} ${FLOOR}) scale(${FIGURE_SCALE})`}>
          <Character preset={pilot} pose="sit" mood={PILOT_MOOD[day]} says={says?.pilot} />
        </g>
        <g transform={`translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
          <Character
            preset={day === 3 ? CAPTAIN_WITH_CARD : captain}
            pose={day === 3 ? 'hold' : 'point'}
            says={says?.captain}
          />
        </g>
      </ControlRoom>
    </svg>
  );
}
