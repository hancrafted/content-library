import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ART_STRETCH, ART_TOP, RoomArt } from './room-art';

/** The room's floor line in the Scene's 1200 by 800 space: the Spec's floor at 432, stretched and moved to the art box. */
const FLOOR = ART_TOP + 432 * ART_STRETCH;
/** Small enough that the screens stay under the index board. */
const CREW_SCALE = 1.7;
/** The console where the Spec stands it, from 478 to 818. */
const CONSOLE_WIDTH = 200;
const CONSOLE_X = 281;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
/** The Spec's pilot sits with his hands on the desk: his chair rolls this far in from the shared console's seat. */
const PILOT_REACH = 24;

/**
 * The control room with a crowded index (Option 13a): the pilot sits at the console under a question mark, guessing
 * between near-twin cards. Figures are the shared cast (design-ADR 0025), the question mark the pilot's own `confused`
 * emote; the walls and floor are this Slide's drawing (`room-art`).
 */
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
