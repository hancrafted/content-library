import { Robot } from '../deep-sea-expedition/robot';
import { Ship } from '../deep-sea-expedition/ship';
import { shipAnchors } from '../deep-sea-expedition/ship.pure';
import { SURFACE_WATERLINE, ZoneScene } from '../iceberg/zone-scene';
import type { Zone } from '../iceberg/zones.pure';
import { ECHO_SHIP, SHIP_REACH } from './echo-layout.pure';
import type { RobotState } from './robot-story.pure';

const DIVE_X = 600;
const DEPTH: Record<'in-water' | 'seabed', number> = { 'in-water': 470, seabed: 600 };
const ROBOT_SCALE = 1.8;
const UNDER_A_FRAME = { hanging: -70, 'in-water': 90 } as const;

function Cable({ x, top, bottom }: { readonly x: number; readonly top: number; readonly bottom: number }) {
  return <line x1={x} y1={top} x2={x} y2={bottom} strokeWidth={3} className="stroke-foreground/50" />;
}

function SurfaceDive({ at }: { readonly at: RobotState }) {
  const anchors = shipAnchors();
  const onDeck = at === 'deck' || at === 'recovered';
  const robot = <Robot aim={onDeck ? 'ahead' : 'down'} lamp={!onDeck} state={at} />;
  const hang = at === 'hanging' ? UNDER_A_FRAME.hanging : UNDER_A_FRAME['in-water'];
  return (
    <Ship
      rock
      transform={`translate(${ECHO_SHIP.x} ${SURFACE_WATERLINE}) scale(${ECHO_SHIP.scale})`}
      deck={
        onDeck ? (
          <g transform={`translate(${anchors.robot.x} ${anchors.robot.y - 60}) scale(0.8)`}>{robot}</g>
        ) : (
          <>
            <Cable x={anchors.aFrameTip.x} top={anchors.aFrameTip.y} bottom={hang} />
            <g transform={`translate(${anchors.aFrameTip.x} ${hang}) scale(0.9)`}>{robot}</g>
          </>
        )
      }
    />
  );
}

function DeepDive({ at }: { readonly at: RobotState }) {
  const depth = DEPTH[at === 'seabed' ? 'seabed' : 'in-water'];
  return (
    <>
      <Cable x={DIVE_X} top={0} bottom={depth} />
      <g transform={`translate(${DIVE_X} ${depth}) scale(${ROBOT_SCALE})`}>
        <Robot aim="down" state={at} />
      </g>
    </>
  );
}

export function EchoDrawing({ zone, robot }: { readonly zone: Zone; readonly robot: RobotState }) {
  const surface = zone === 'surface';
  return (
    <ZoneScene
      zone={zone}
      sectionTitle={surface ? { figuresReach: SHIP_REACH } : true}
      className="absolute inset-0 size-full"
    >
      {surface ? <SurfaceDive at={robot} /> : <DeepDive at={robot} />}
    </ZoneScene>
  );
}
