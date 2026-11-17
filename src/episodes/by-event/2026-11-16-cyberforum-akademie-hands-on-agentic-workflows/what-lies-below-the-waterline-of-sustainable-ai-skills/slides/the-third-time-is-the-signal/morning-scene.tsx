import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { CONSOLE_DESK_HEIGHT } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { RoomArt } from './room-art';
import artStyles from './room-art.module.css';
import { ROOM_ART, WRITTEN_CARD } from './room-facets';
import { CAPTAIN_X, FIGURE_SCALE, PILOT_MOOD, PILOT_X, SPEC_CAPTAIN, SPEECH, type Day } from './speech.pure';

export type { Day } from './speech.pure';

const FLOOR = ROOM_ART.floor;
const CONSOLE = { x: 270, width: 90 } as const;
const CARD_TRANSFORM = `translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE / SPEC_CAPTAIN.scale}) translate(${-SPEC_CAPTAIN.x} ${-FLOOR})`;
const CARD_LINES = 'M123 160h20M123 167h22M123 174h16M123 181h20';

export interface MorningSceneProps {
  readonly day: Day;
  readonly label: string;
  readonly says?: { readonly captain: string; readonly pilot: string };
}

type Says = MorningSceneProps['says'];

function Captain({ day, says }: { readonly day: Day; readonly says: Says }) {
  return (
    <>
      <g transform={`translate(${CAPTAIN_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
        <Character preset={captain} pose={day === 3 ? 'hold' : 'point'} says={says?.captain} bubble={SPEECH.captain} />
      </g>
      {day === 3 && (
        <g data-written-card transform={CARD_TRANSFORM}>
          <ToneFacets facets={WRITTEN_CARD} />
          <path d={CARD_LINES} className={artStyles.cardLines} />
        </g>
      )}
    </>
  );
}

function Pilot({ day, says }: { readonly day: Day; readonly says: Says }) {
  return (
    <g transform={`translate(${PILOT_X} ${FLOOR}) scale(${FIGURE_SCALE})`}>
      <Character preset={pilot} pose="sit" mood={PILOT_MOOD[day]} flip says={says?.pilot} bubble={SPEECH.pilot[day]} />
    </g>
  );
}

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
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
