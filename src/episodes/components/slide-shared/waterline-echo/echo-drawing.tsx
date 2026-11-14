import { Robot } from '../deep-sea-expedition/robot';
import { Ship } from '../deep-sea-expedition/ship';
import { shipAnchors } from '../deep-sea-expedition/ship.pure';
import type { Zone } from '../iceberg/ruler.pure';
import { SURFACE_WATERLINE, ZoneScene } from '../iceberg/zone-scene';

/** Where the robot sits in a section slide's scene: on deck, just over the water, on its cable, or on the seabed. */
export type RobotAt = 'deck' | 'surface' | 'hanging' | 'seabed';

const SHIP_X = 760;
/** Below the Surface the robot hangs mid-Scene, under the Slide's heading and clear of its card and ruler. */
const DIVE_X = 600;
const DEPTH: Record<'hanging' | 'seabed', number> = { hanging: 470, seabed: 600 };
const ROBOT_SCALE = 1.8;

/** The cable the robot hangs on, from `top` down to its bail. */
function Cable({ x, top, bottom }: { readonly x: number; readonly top: number; readonly bottom: number }) {
  return <line x1={x} y1={top} x2={x} y2={bottom} strokeWidth={3} className="stroke-foreground/50" />;
}

/** The robot at its depth, on its cable from the ship's A-frame or from above the Scene. */
function Dive({ at, surface }: { readonly at: RobotAt; readonly surface: boolean }) {
  const anchors = shipAnchors();
  const robot = <Robot aim={at === 'deck' ? 'ahead' : 'down'} lamp={at !== 'deck'} />;
  if (surface) {
    return (
      <Ship
        rock
        transform={`translate(${SHIP_X} ${SURFACE_WATERLINE})`}
        deck={
          at === 'deck' ? (
            <g transform={`translate(${anchors.robot.x} ${anchors.robot.y - 60}) scale(0.8)`}>{robot}</g>
          ) : (
            <>
              <Cable x={anchors.aFrameTip.x} top={anchors.aFrameTip.y} bottom={-70} />
              <g transform={`translate(${anchors.aFrameTip.x} -70) scale(0.9)`}>{robot}</g>
            </>
          )
        }
      />
    );
  }
  const depth = DEPTH[at === 'seabed' ? 'seabed' : 'hanging'];
  return (
    <>
      <Cable x={DIVE_X} top={0} bottom={depth} />
      <g transform={`translate(${DIVE_X} ${depth}) scale(${ROBOT_SCALE})`}>{robot}</g>
    </>
  );
}

/**
 * A section slide's drawing, the Hero motif echoed at the Section's depth (picked Title-slide Option 0a): the zone's
 * Scene with the robot sunk to the Section's depth. It is the section slide's rear decoration, full-bleed from edge to
 * edge like the Title slide's hero, so it runs under the table of contents while the Slide's words stay inset.
 */
export function EchoDrawing({ zone, robotAt }: { readonly zone: Zone; readonly robotAt: RobotAt }) {
  return (
    <ZoneScene zone={zone} className="absolute inset-0 size-full">
      <Dive at={robotAt} surface={zone === 'surface'} />
    </ZoneScene>
  );
}
