import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ART_STRETCH, ART_TOP, RoomArt } from './room-art';

const FLOOR = ART_TOP + 432 * ART_STRETCH;
const CREW_SCALE = 1.7;
const CONSOLE_WIDTH = 200;
const CONSOLE_X = 281;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
const PILOT_REACH = 24;

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export function ControlRoom() {
  return (
    <g>
      <RoomArt />
      <g transform={`translate(0 ${FLOOR}) scale(${CREW_SCALE})`}>
        <g transform={`translate(${CONSOLE_X} ${-70})`}>
          <Console width={CONSOLE_WIDTH} mugs={1} />
          <g transform={`translate(${SEAT.x + PILOT_REACH} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" mood="confused" />
          </g>
        </g>
      </g>
    </g>
  );
}
