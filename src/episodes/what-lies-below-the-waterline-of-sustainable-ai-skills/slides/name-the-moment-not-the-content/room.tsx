import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ART_SCALE, ART_TOP, RoomArt } from './room-art';

/** The room's floor line in the Scene's 1200 by 800 space: the Spec's floor at 584, widened and moved to the art box. */
const FLOOR = ART_TOP + 584 * ART_SCALE;
const CREW_SCALE = 2.3;
const CONSOLE_WIDTH = 92;
const CONSOLE_X = 225;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
/** The Spec's pilot sits with his hands on the desk: his chair rolls this far in from the shared console's seat. */
const PILOT_REACH = 24;

/**
 * The control room on the day of the dive (Option 12a): the captain stands and gestures at the left, the pilot sits at
 * the console facing the index on the wall; no window, since the robot is not this Slide's subject. Figures are the
 * shared cast (design-ADR 0025); the walls and floor are this Slide's drawing (`room-art`).
 */
export function ControlRoom() {
  return (
    <g>
      <RoomArt />
      <g transform={`translate(0 ${FLOOR}) scale(${CREW_SCALE})`}>
        <g transform="translate(40 0)">
          <Character preset={captain} pose="point" />
        </g>
        <g transform={`translate(${CONSOLE_X} ${-70})`}>
          <Console width={CONSOLE_WIDTH} mugs={1} />
          <g transform={`translate(${SEAT.x + PILOT_REACH} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
    </g>
  );
}
