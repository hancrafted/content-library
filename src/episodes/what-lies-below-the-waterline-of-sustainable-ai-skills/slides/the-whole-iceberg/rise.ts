import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import type { Zone } from '@/episodes/components/slide-shared/iceberg/ruler.pure';
import { depthBands, WHOLE_DEPTH } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';

/*
 * Where the robot rises in "The whole iceberg" (Option 26a), in the whole depth's units: straight up under the
 * A-frame from the seabed to its rest beside the stern, so the trail, its nodes and the rows' light share one clock.
 */

/** The ship's midships on the waterline; its A-frame tip then hangs over the trail. */
export const SHIP_X = 395;
const A_FRAME = shipAnchors().aFrameTip;
/** The trail and the robot's cable run straight down from the A-frame tip. */
export const TRAIL_X = SHIP_X + A_FRAME.x;
export const A_FRAME_Y = WHOLE_DEPTH.waterline + A_FRAME.y;
/** The robot's top at rest, hanging just below the A-frame beside the stern, and on the seabed where it starts. */
export const ROBOT_REST_Y = A_FRAME_Y + 24;
export const ROBOT_START_Y = 800;
export const RISE = ROBOT_START_Y - ROBOT_REST_Y;
export const RISE_DELAY_MS = 300;
export const RISE_MS = 2400;

/** Each zone's node on the trail, at the middle of its row of words. */
export const NODES: readonly { readonly zone: Zone; readonly y: number }[] = depthBands().map(({ zone, top }) => ({
  zone,
  y: top + WHOLE_DEPTH.band / 2,
}));

/** When the rising robot passes a node, from the Slide turning active: the Abyss first, the Surface last. */
export function passesAt(y: number): number {
  return Math.round(RISE_DELAY_MS + (RISE_MS * Math.max(0, ROBOT_START_Y - y)) / RISE);
}
