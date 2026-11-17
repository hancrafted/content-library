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
const PILOT_REACH = 24;

export interface Request {
  readonly chat: string;
  readonly coding: string;
}

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
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
          <g transform={`translate(${SEAT.x + PILOT_REACH} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
    </g>
  );
}
