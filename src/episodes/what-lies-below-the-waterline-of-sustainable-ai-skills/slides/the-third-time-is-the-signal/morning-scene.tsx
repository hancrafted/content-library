import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { CONSOLE_DESK_HEIGHT } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Facets, RoomArt } from './room-art';
import artStyles from './room-art.module.css';
import { ROOM_ART, WRITTEN_CARD } from './room-facets';
import { CAPTAIN_X, FIGURE_SCALE, PILOT_MOOD, PILOT_X, SPEC_CAPTAIN, SPEECH, type Day } from './speech.pure';

export type { Day } from './speech.pure';

const FLOOR = ROOM_ART.floor;
/** The console against the right wall, as the Spec stands it; the pilot sits in front of it, turned to the captain. */
const CONSOLE = { x: 270, width: 90 } as const;
/** The written card in the captain's hand on day 3: drawn against the Spec's captain, moved and scaled with ours. */
const CARD_TRANSFORM = `translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE / SPEC_CAPTAIN.scale}) translate(${-SPEC_CAPTAIN.x} ${-FLOOR})`;
/** The card's ruled lines, in room units, as the Spec draws them. */
const CARD_LINES = 'M123 160h20M123 167h22M123 174h16M123 181h20';

export interface MorningSceneProps {
  readonly day: Day;
  /** The picture's words for assistive tech. */
  readonly label: string;
  /** What the captain and the pilot say, in the shared speech bubbles; left out, the picture shows no speech. */
  readonly says?: { readonly captain: string; readonly pilot: string };
}

type Says = MorningSceneProps['says'];

/** The captain, pointing or holding the written card out on day 3, which is drawn in her hand. */
function Captain({ day, says }: { readonly day: Day; readonly says: Says }) {
  return (
    <>
      <g transform={`translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
        <Character preset={captain} pose={day === 3 ? 'hold' : 'point'} says={says?.captain} bubble={SPEECH.captain} />
      </g>
      {day === 3 && (
        <g data-written-card transform={CARD_TRANSFORM}>
          <Facets facets={WRITTEN_CARD} />
          <path d={CARD_LINES} className={artStyles.cardLines} />
        </g>
      )}
    </>
  );
}

/** The pilot at his console, turned to the captain; drawn last, so his bubble sits over her stretched tail. */
function Pilot({ day, says }: { readonly day: Day; readonly says: Says }) {
  return (
    <g transform={`translate(${PILOT_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
      <Character preset={pilot} pose="sit" mood={PILOT_MOOD[day]} flip says={says?.pilot} bubble={SPEECH.pilot[day]} />
    </g>
  );
}

/**
 * One morning in the control room, the comic's panel picture: the captain explains, the pilot turns from his console
 * to listen. Only the mug count and the captain's pose change from day to day; on day 3 she holds the written card
 * out. The room is this Slide's own drawing (`RoomArt`, Spec Option 8a); the people and the console are the shared
 * figures (design-ADR 0025), and their speech is the shared bubble, the captain's lifted above the pilot's
 * (`speech.pure.ts`, decision 53).
 */
export function MorningScene({ day, label, says }: MorningSceneProps) {
  return (
    <svg
      viewBox={`0 0 ${ROOM_ART.width} ${ROOM_ART.height}`}
      role="img"
      aria-label={label}
      data-morning={day}
      className="block h-auto w-full"
    >
      <RoomArt>
        <Console
          width={CONSOLE.width}
          mugs={day}
          transform={`translate(${CONSOLE.x} ${FLOOR - CONSOLE_DESK_HEIGHT})`}
        />
        <Captain day={day} says={says} />
        <Pilot day={day} says={says} />
      </RoomArt>
    </svg>
  );
}
