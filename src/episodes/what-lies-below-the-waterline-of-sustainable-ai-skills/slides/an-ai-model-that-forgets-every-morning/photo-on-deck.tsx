import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { SCENE_HEIGHT, SCENE_WIDTH, SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';

/*
 * The framed photo's picture (Spec Option 1a, first panel): you and the pilot side by side on the research ship's deck,
 * ten years of projects. Drawn in `ZoneScene`'s 1200 by 800 space from the shared ship and cast (design-ADR 0025).
 */

const SHIP_X = 810;
const SHIP_SCALE = 4.2;
const CREW_SCALE = 0.42;
const ROBOT_SCALE = 0.55;
/** The robot is drawn hanging from its cable at (0, 0); this lifts it to sit on its cradle. */
const ROBOT_HEIGHT = 59;
/** The pilot stands this far forward of the captain on deck, in the ship's units. */
const PILOT_STEP = 30;
/** The figure's height above its feet, in its own units, where the tag sits. */
const HEAD_HEIGHT = 112;

const ANCHORS = shipAnchors();
const { aft } = ANCHORS.deck;

/** Where the pilot's head is in the photo, as a share of the Scene's width and height: the "AI model" tag sits there. */
export const PILOT_HEAD = {
  left: (SHIP_X + (aft.x + PILOT_STEP) * SHIP_SCALE) / SCENE_WIDTH,
  top: (SURFACE_WATERLINE + (aft.y - HEAD_HEIGHT * CREW_SCALE) * SHIP_SCALE) / SCENE_HEIGHT,
} as const;

/** The research ship with the captain and the pilot on its stern deck, the robot in its cradle. */
export function PhotoOnDeck() {
  const { robot } = ANCHORS;
  return (
    <Ship
      transform={`translate(${SHIP_X} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`}
      deck={
        <>
          <g transform={`translate(${robot.x} ${robot.y - ROBOT_HEIGHT * ROBOT_SCALE}) scale(${ROBOT_SCALE})`}>
            <Robot lamp={false} />
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
