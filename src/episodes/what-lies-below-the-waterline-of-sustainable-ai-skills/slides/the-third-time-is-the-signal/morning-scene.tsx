import type { Mood } from '@/episodes/components/slide-shared/character/actor';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { CONSOLE_DESK_HEIGHT } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Facets, ROOM_ART, RoomArt } from './room-art';
import artStyles from './room-art.module.css';
import { WRITTEN_CARD } from './room-facets';

export type Day = 1 | 2 | 3;

const FLOOR = ROOM_ART.floor;
/** The console against the right wall, as the Spec stands it; the pilot sits in front of it, turned to the captain. */
const CONSOLE = { x: 270, width: 90 } as const;
const PILOT_X = 246;
const CAPTAIN_X = 84;
/** The figures at the Spec's size in its 360 by 280 room. */
const FIGURE_SCALE = 1.3;
/** The pilot's look each morning: puzzled, then working it through, then satisfied. */
const PILOT_MOOD: Record<Day, Mood> = { 1: 'confused', 2: 'thinking', 3: 'happy' };
/** The written card in the captain's hand on day 3, offset from the Spec's room to the captain's own frame. */
const CARD_OFFSET = { x: 0, y: 0 } as const;
/** The card's ruled lines, in room units, as the Spec draws them. */
const CARD_LINES = 'M123 160h20M123 167h22M123 174h16M123 181h20';

export interface MorningSceneProps {
  readonly day: Day;
  /** The picture's words for assistive tech. */
  readonly label: string;
}

/**
 * One morning in the control room, the comic's panel picture: the captain explains, the pilot turns from his console
 * to listen. Only the mug count and the captain's pose change from day to day; on day 3 she holds the written card
 * out. The room is this Slide's own drawing (`RoomArt`, Spec Option 8a); the people and the console are the shared
 * figures (design-ADR 0025). What they say is the panel's own HTML speech, over the picture.
 */
export function MorningScene({ day, label }: MorningSceneProps) {
  const deskTop = FLOOR - CONSOLE_DESK_HEIGHT;
  return (
    <svg
      viewBox={`0 0 ${ROOM_ART.width} ${ROOM_ART.height}`}
      role="img"
      aria-label={label}
      data-morning={day}
      className="block h-auto w-full"
    >
      <RoomArt>
        <Console width={CONSOLE.width} mugs={day} transform={`translate(${CONSOLE.x} ${deskTop})`} />
        <g transform={`translate(${PILOT_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
          <Character preset={pilot} pose="sit" mood={PILOT_MOOD[day]} flip />
        </g>
        <g transform={`translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
          <Character preset={captain} pose={day === 3 ? 'hold' : 'point'} />
        </g>
        {day === 3 && (
          <g data-written-card transform={`translate(${CARD_OFFSET.x} ${CARD_OFFSET.y})`}>
            <Facets facets={WRITTEN_CARD} />
            <path d={CARD_LINES} className={artStyles.cardLines} />
          </g>
        )}
      </RoomArt>
    </svg>
  );
}
