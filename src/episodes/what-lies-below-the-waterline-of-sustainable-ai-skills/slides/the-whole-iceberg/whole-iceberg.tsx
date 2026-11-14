import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { WholeDepthScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { WHOLE_DEPTH } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import type { CSSProperties, ReactNode } from 'react';
import styles from './iceberg.module.css';
import {
  A_FRAME_Y,
  NODES,
  passesAt,
  RISE,
  RISE_DELAY_MS,
  RISE_MS,
  ROBOT_REST_Y,
  ROBOT_START_Y,
  SHIP_X,
  TRAIL_X,
} from './rise';

const ANCHORS = shipAnchors();
/** The crew at the ship's scale, seen through the bridge windows. */
const CREW_SCALE = 0.42;
const ROBOT_SCALE = 0.8;
/** The open manual on the foredeck, and where its leader meets the index page in the sky. */
const MANUAL = { x: SHIP_X + ANCHORS.deck.fore.x - 8, y: WHOLE_DEPTH.waterline + ANCHORS.deck.fore.y };
const PAGE_EDGE = { x: 600, y: 175 };
const NODE = 7;
const HALO = 13;

const diamond = (x: number, y: number, r: number) => `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;

/** The dashed trail the robot took up from the seabed, a node at each zone lighting as it passes. */
function RiseTrail() {
  return (
    <g data-rise-trail className={styles.trail}>
      <line x1={TRAIL_X} y1={ROBOT_START_Y + 30} x2={TRAIL_X} y2={WHOLE_DEPTH.waterline + 8} className={styles.dash} />
      {NODES.map(({ zone, y }) => (
        <g
          key={zone}
          data-trail-node={zone}
          className={styles.light}
          style={{ '--light-delay': `${passesAt(y)}ms` } as CSSProperties}
        >
          <polygon points={diamond(TRAIL_X, y, HALO)} className={styles.halo} />
          <polygon points={diamond(TRAIL_X, y, NODE)} className={styles.node} />
        </g>
      ))}
    </g>
  );
}

/**
 * The robot rising on its cable from the seabed to its rest under the A-frame. The cable hangs from the A-frame tip
 * and stretches down to the robot's start, shortening on the robot's clock as the robot rises with its `Travel`.
 */
function RisingRobot() {
  const reach = ROBOT_REST_Y - A_FRAME_Y;
  const clock = {
    '--cable-from': (reach + RISE) / reach,
    '--rise-duration': `${RISE_MS}ms`,
    '--rise-delay': `${RISE_DELAY_MS}ms`,
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
      <Travel from={`0 ${(RISE / WHOLE_DEPTH.height) * 100}%`} duration={RISE_MS} delay={RISE_DELAY_MS}>
        <g transform={`translate(${TRAIL_X} ${ROBOT_REST_Y}) scale(${ROBOT_SCALE})`}>
          <Robot lamp={false} />
        </g>
      </Travel>
    </>
  );
}

/** The manual open on the foredeck, its pages and spine, with a dotted leader up to the index page beside it. */
function OpenManual() {
  const { x, y } = MANUAL;
  return (
    <g data-open-manual>
      <line x1={x + 16} y1={y - 12} x2={PAGE_EDGE.x} y2={PAGE_EDGE.y} className={styles.leader} />
      <polygon points={`${x - 30},${y - 4} ${x},${y} ${x},${y - 12} ${x - 28},${y - 16}`} className={styles.page} />
      <polygon points={`${x},${y} ${x + 30},${y - 4} ${x + 28},${y - 16} ${x},${y - 12}`} className={styles.pageLit} />
      <polygon
        points={`${x - 2},${y} ${x + 2},${y} ${x + 1.5},${y - 12} ${x - 1.5},${y - 12}`}
        className={styles.spine}
      />
    </g>
  );
}

/**
 * "The whole iceberg" (Option 26a) as one Scene, Surface to Abyss: the ship on the waterline with the captain and the
 * pilot on the bridge, the manual open on the foredeck, the robot rising on its cable from the seabed up the trail to
 * the A-frame, and the whole iceberg to the right. The Slide's words go in `overlay`, on the water at their depths.
 */
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
