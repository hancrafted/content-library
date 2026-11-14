import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { RoomArt } from './room-art';
import styles from './slide.module.css';
import { CAPTAIN_X, CREW_SCALE, FLOOR, REQUEST_BUBBLE } from './speech.pure';

const CONSOLE_WIDTH = 92;
const CONSOLE_X = 225;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;

/** What the captain says in each view: the request in the Chat app, the prompt in the Coding agent. */
export interface Request {
  readonly chat: string;
  readonly coding: string;
}

/**
 * The control room on the day of the dive (Option 12a): the captain stands and gestures at the left, saying your
 * request in the shared Character's own bubble (decision 53), the pilot sits at the console facing the index on the
 * wall; no window, since the robot is not this Slide's subject. The captain is drawn once per view and the other view's
 * drawing hides, so the bubble's words follow the page's view. Figures are the shared cast (design-ADR 0025); the walls
 * and floor are this Slide's drawing (`room-art`).
 */
export function ControlRoom({ request }: { readonly request: Request }) {
  return (
    <g>
      <RoomArt />
      <g transform={`translate(0 ${FLOOR}) scale(${CREW_SCALE})`}>
        {(['chat', 'coding'] as const).map((view) => (
          <g key={view} data-request={view} data-view={view} className={styles.inView}>
            <g transform={`translate(${CAPTAIN_X} 0)`}>
              <Character preset={captain} pose="point" says={request[view]} bubble={REQUEST_BUBBLE} />
            </g>
          </g>
        ))}
        <g transform={`translate(${CONSOLE_X} ${-70})`}>
          <Console width={CONSOLE_WIDTH} mugs={1} />
          <g transform={`translate(${SEAT.x} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
    </g>
  );
}
