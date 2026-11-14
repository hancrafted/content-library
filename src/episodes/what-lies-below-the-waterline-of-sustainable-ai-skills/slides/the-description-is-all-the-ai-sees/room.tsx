import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ART_TOP, BinderSurround, RoomArt } from './room-art';

/** The room's floor line in the Scene's 1200 by 800 space: the Spec's floor at 472, moved down to the art box. */
const FLOOR = ART_TOP + 472;
/** The crew and console at the room's scale. */
const CREW_SCALE = 2;
const CONSOLE_WIDTH = 120;
/** The console where the Spec stands it, its left edge at 366. */
const CONSOLE_X = 183;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;
/** The Spec's pilot sits with his hands on the desk: his chair rolls this far in from the shared console's seat. */
const PILOT_REACH = 24;

/**
 * The control room from the pilot's chair (Option 11a): the captain at the left calls out the new site, the pilot sits
 * at the console, the window shows the buoy at the new site, and the shut cards fan out behind the binder. Figures are
 * the shared cast (design-ADR 0025); the room, the reading light and the cards are this Slide's drawing (`room-art`).
 */
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
