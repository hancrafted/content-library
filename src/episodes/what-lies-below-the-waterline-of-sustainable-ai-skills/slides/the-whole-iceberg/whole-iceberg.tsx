import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { WholeDepthScene } from '@/episodes/components/slide-shared/iceberg/whole-depth-scene';
import { WHOLE_DEPTH } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import type { CSSProperties, ReactNode } from 'react';
import styles from './iceberg.module.css';
import { ManualArt, TrailBubbles } from './index-art';
import {
  A_FRAME_Y,
  NODES,
  passesAt,
  RISE,
  RISE_DELAY_MILLISECONDS,
  RISE_MILLISECONDS,
  ROBOT_REST_Y,
  ROBOT_START_Y,
  SHIP_X,
  TRAIL_X,
} from './rise';

const ANCHORS = shipAnchors();
const CREW_SCALE = 0.42;
const ROBOT_SCALE = 0.8;
const MANUAL = { x: SHIP_X + ANCHORS.deck.fore.x - 8, y: WHOLE_DEPTH.waterline + ANCHORS.deck.fore.y };
const PAGE_EDGE = { x: 600, y: 175 };
const NODE = 7;
const HALO = 13;

const diamond = (x: number, y: number, r: number) => `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;

function RiseTrail() {
  return (
    <g data-rise-trail className={styles.trail}>
      <line x1={TRAIL_X} y1={ROBOT_START_Y + 30} x2={TRAIL_X} y2={WHOLE_DEPTH.waterline + 8} className={styles.dash} />
      {NODES.map(({ zone, y, unlit }) => (
        <g
          key={zone}
          data-trail-node={zone}
          data-unlit={unlit ? '' : undefined}
          className={unlit ? styles.unlit : styles.light}
          style={unlit ? undefined : ({ '--light-delay': `${passesAt(y)}ms` } as CSSProperties)}
        >
          <polygon points={diamond(TRAIL_X, y, HALO)} className={styles.halo} />
          <polygon points={diamond(TRAIL_X, y, NODE)} className={styles.node} />
        </g>
      ))}
      <TrailBubbles trailX={TRAIL_X} nodes={NODES.filter(({ unlit }) => !unlit).map(({ y }) => y)} />
    </g>
  );
}

const ROBOT_RISE_FROM = `0 ${(RISE / WHOLE_DEPTH.height) * 100}%`;

function RisingRobot() {
  const reach = ROBOT_REST_Y - A_FRAME_Y;
  const clock = {
    '--cable-from': (reach + RISE) / reach,
    '--rise-duration': `${RISE_MILLISECONDS}ms`,
    '--rise-delay': `${RISE_DELAY_MILLISECONDS}ms`,
  } as CSSProperties;
  return (
    <>
      <line
        data-cable
        x1={TRAIL_X}
        y1={A_FRAME_Y}
        x2={TRAIL_X}
        y2={ROBOT_REST_Y}
        vectorEffect="non-scaling-stroke"
        style={clock}
        className={styles.cable}
      />
      <Travel from={ROBOT_RISE_FROM} duration={RISE_MILLISECONDS} delay={RISE_DELAY_MILLISECONDS}>
        <g transform={`translate(${TRAIL_X} ${ROBOT_REST_Y}) scale(${ROBOT_SCALE})`}>
          <Robot state={robotAt('the-whole-iceberg').state} lamp={false} />
        </g>
      </Travel>
    </>
  );
}

function OpenManual() {
  const { x, y } = MANUAL;
  return (
    <g data-open-manual>
      <line x1={x + 16} y1={y - 12} x2={PAGE_EDGE.x} y2={PAGE_EDGE.y} className={styles.leader} />
      <ManualArt x={x} y={y} />
    </g>
  );
}

export function WholeIceberg({ label, overlay }: { readonly label: string; readonly overlay: ReactNode }) {
  return (
    <WholeDepthScene label={label} overlay={overlay} className="@container overflow-hidden rounded-2xl shadow-md">
      <RiseTrail />
      <Ship
        transform={`translate(${SHIP_X} ${WHOLE_DEPTH.waterline})`}
        bridge={
          <>
            <g transform={`translate(${ANCHORS.bridge.captain.x} ${ANCHORS.bridge.captain.y}) scale(${CREW_SCALE})`}>
              <Character preset={captain} />
            </g>
            <g transform={`translate(${ANCHORS.bridge.pilot.x} ${ANCHORS.bridge.pilot.y}) scale(${CREW_SCALE})`}>
              <Character preset={pilot} pose="steer" />
            </g>
          </>
        }
      />
      <OpenManual />
      <RisingRobot />
    </WholeDepthScene>
  );
}
