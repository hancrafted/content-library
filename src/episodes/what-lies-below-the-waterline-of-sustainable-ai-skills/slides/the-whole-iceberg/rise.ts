import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { depthBands, WHOLE_DEPTH } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import type { Zone } from '@/episodes/components/slide-shared/iceberg/zones.pure';

export const SHIP_X = 395;
const A_FRAME = shipAnchors().aFrameTip;
export const TRAIL_X = SHIP_X + A_FRAME.x;
export const A_FRAME_Y = WHOLE_DEPTH.waterline + A_FRAME.y;
export const ROBOT_REST_Y = A_FRAME_Y + 24;
export const ROBOT_START_Y = 800;
export const RISE = ROBOT_START_Y - ROBOT_REST_Y;
export const RISE_DELAY_MILLISECONDS = 300;
export const RISE_MILLISECONDS = 2400;

/**
 * Each zone's node on the trail, at the middle of its row of words. The Surface's row floats in the sky above the
 * A-frame (decision 27 of feedback 2), so the robot never reaches its node: it stays `unlit`.
 */
export const NODES: readonly { readonly zone: Zone; readonly y: number; readonly unlit: boolean }[] = depthBands().map(
  ({ zone, top }) => {
    const y = top + WHOLE_DEPTH.band / 2;
    return { zone, y, unlit: y < ROBOT_REST_Y };
  },
);

export function passesAt(y: number): number {
  return Math.round(
    RISE_DELAY_MILLISECONDS + (RISE_MILLISECONDS * Math.min(RISE, Math.max(0, ROBOT_START_Y - y))) / RISE,
  );
}
