import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ART_TOP, BinderSurround, RoomArt } from './room-art';

const FLOOR = ART_TOP + 472;
const CREW_SCALE = 2;
const CONSOLE_WIDTH = 120;
const CONSOLE_X = 183;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
const PILOT_REACH = 24;

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
export function ControlRoom({ says }: { readonly says: string }) {
  return (
    <g>
      <RoomArt />
      <g transform={`translate(0 ${FLOOR}) scale(${CREW_SCALE})`}>
        <g transform="translate(30 0)">
          <Character preset={captain} pose="point" says={says} />
        </g>
        <g transform={`translate(${CONSOLE_X} ${-70})`}>
          <Console width={CONSOLE_WIDTH} mugs={1} />
          <g transform={`translate(${SEAT.x + PILOT_REACH} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
      <BinderSurround />
    </g>
  );
}
