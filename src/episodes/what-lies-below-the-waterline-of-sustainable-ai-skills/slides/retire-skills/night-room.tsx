import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { useId } from 'react';
import { PORTHOLE } from './crate-facets';
import styles from './retire.module.css';
import { NightWall, PortholeArt } from './room-art';

/** Low in the wall between the sheets, where the cards leave it in view, in the Scene's 1200 by 800 units. */
const PORTHOLE_AT = { x: 600, y: 735, r: 50 } as const;
/** The Spec's porthole, 40 across its glass, moved and scaled to its place in this room. */
const PORTHOLE_PLACE = `translate(${PORTHOLE_AT.x} ${PORTHOLE_AT.y}) scale(${PORTHOLE_AT.r / PORTHOLE.r}) translate(${-PORTHOLE.x} ${-PORTHOLE.y})`;
const CONSOLE_WIDTH = 120;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;

/** The robot hanging in the porthole's water on its cable, lamp on, in the Spec's porthole units. */
function PortholeRobot() {
  return (
    <g>
      <line
        x1={PORTHOLE.x}
        y1={PORTHOLE.y - PORTHOLE.r}
        x2={PORTHOLE.x}
        y2={PORTHOLE.y - 12}
        className={styles.cable}
      />
      <g transform={`translate(${PORTHOLE.x} ${PORTHOLE.y - 12}) scale(0.5)`}>
        <Robot aim="down" />
      </g>
    </g>
  );
}

/**
 * The control room at night (Option 25b): the Spec's faceted night wall, the porthole onto the Abyss with its brass
 * rim, the robot hanging inside on its cable with its lamp on, and the pilot at the console. The wall and porthole are
 * lifted from the Spec (`room-art.tsx`); the figures are the shared cast (design-ADR 0025).
 */
export function NightRoom() {
  const clip = useId();
  return (
    <g>
      <NightWall />
      <g transform={PORTHOLE_PLACE}>
        <PortholeArt clipId={clip} robot={<PortholeRobot />} />
      </g>
      <g transform="translate(900 800) scale(1.6)">
        <g transform="translate(0 -70)">
          <Console width={CONSOLE_WIDTH} />
          <g transform={`translate(${SEAT.x} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
    </g>
  );
}
