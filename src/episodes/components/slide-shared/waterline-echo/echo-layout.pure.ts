import { shipAnchors } from '../deep-sea-expedition/ship.pure';

export const ECHO_SHIP = { x: 640, scale: 0.8 } as const;

const SHIP_BOX = { top: 190, stern: -176, bow: 178 } as const;
const ROBOT_HALF = 45;

/** How far the ship reaches above the waterline, in the Scene's units: what must stay below the title. */
export const SHIP_REACH = SHIP_BOX.top * ECHO_SHIP.scale;

export function echoShipSpan(): { readonly left: number; readonly right: number } {
  const stern = Math.min(SHIP_BOX.stern, shipAnchors().aFrameTip.x - ROBOT_HALF);
  return { left: ECHO_SHIP.x + stern * ECHO_SHIP.scale, right: ECHO_SHIP.x + SHIP_BOX.bow * ECHO_SHIP.scale };
}
