/*
 * Where a Surface section slide sets the research ship and its robot (feedback 3, decisions 45 and 48; Han's Image 30):
 * right of the Scene's middle, small enough that a phone shows the whole ship, its masthead `SHIP_REACH` above the
 * waterline, which `ZoneScene` keeps below the Section title's last line at every width.
 */
import { shipAnchors } from '../deep-sea-expedition/ship.pure';

/** The ship on a Surface section slide: its centre across the Scene and its size. */
export const ECHO_SHIP = { x: 640, scale: 0.8 } as const;

/** The ship's own reach, in its units: masthead and pennant above the waterline, stern and bow across (`Ship`). */
const SHIP_BOX = { top: 190, stern: -176, bow: 178 } as const;
/** Half the robot's width at the size it hangs from the A-frame, in the ship's units. */
const ROBOT_HALF = 45;

/** How far the ship reaches above the waterline, in the Scene's units: what must stay below the title. */
export const SHIP_REACH = SHIP_BOX.top * ECHO_SHIP.scale;

/** The ship's span across the Scene, the robot hanging under its A-frame included. */
export function echoShipSpan(): { readonly left: number; readonly right: number } {
  const stern = Math.min(SHIP_BOX.stern, shipAnchors().aFrameTip.x - ROBOT_HALF);
  return { left: ECHO_SHIP.x + stern * ECHO_SHIP.scale, right: ECHO_SHIP.x + SHIP_BOX.bow * ECHO_SHIP.scale };
}
