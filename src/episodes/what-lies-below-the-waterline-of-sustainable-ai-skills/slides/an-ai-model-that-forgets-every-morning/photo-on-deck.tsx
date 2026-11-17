import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
const SHIP_X = 600;
const SHIP_SCALE = 2.9;
const CREW_SCALE = 0.72;
const ROBOT_SCALE = 0.55;
const ROBOT_HEIGHT = 59;
const PILOT_STEP = 40;

const ANCHORS = shipAnchors();
const { aft } = ANCHORS.deck;

export function PhotoOnDeck() {
  const { robot } = ANCHORS;
  return (
    <Ship
      transform={`translate(${SHIP_X} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`}
      deck={
        <>
          <g transform={`translate(${robot.x} ${robot.y - ROBOT_HEIGHT * ROBOT_SCALE}) scale(${ROBOT_SCALE})`}>
            <Robot state={robotAt('an-ai-model-that-forgets-every-morning').state} lamp={false} />
          </g>
          <g transform={`translate(${aft.x} ${aft.y}) scale(${CREW_SCALE})`}>
            <Character preset={captain} pose="stand" />
          </g>
          <g transform={`translate(${aft.x + PILOT_STEP} ${aft.y}) scale(${CREW_SCALE})`}>
            <Character preset={pilot} pose="stand" />
          </g>
        </>
      }
    />
  );
}
