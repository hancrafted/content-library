import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { useId } from 'react';
import { PORTHOLE } from './crate-facets';
import styles from './retire.module.css';
import { NightWall, PortholeArt } from './room-art';

const PORTHOLE_AT = { x: 600, y: 735, r: 50 } as const;
const PORTHOLE_PLACE = `translate(${PORTHOLE_AT.x} ${PORTHOLE_AT.y}) scale(${PORTHOLE_AT.r / PORTHOLE.r}) translate(${-PORTHOLE.x} ${-PORTHOLE.y})`;
const CONSOLE_WIDTH = 120;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;

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
        <Robot state={robotAt('retire-skills').state} aim="down" />
      </g>
    </g>
  );
}

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
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
