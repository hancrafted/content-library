import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import type { ActorProps } from '../character/actor';
import { Emote } from '../character/emote';
import styles from './robot.module.css';
import {
  beamPoints,
  LAMP_ORIGIN,
  ROBOT_FACETS,
  robotHead,
  robotLook,
  type RobotAim,
  type RobotFacet,
  type RobotMotion,
} from './robot.pure';

export type { RobotAim, RobotMotion } from './robot.pure';

export interface RobotProps extends ActorProps {
  /** Played once when the Slide turns active; the rest state is the motion's end state. */
  readonly motion?: RobotMotion;
  /** The search lamp and its beam; on unless switched off. `beam-on` and `scan` need it on. */
  readonly lamp?: boolean;
  /** Where the beam points; `ahead` unless the Slide looks at the seabed. */
  readonly aim?: RobotAim;
  /** Faces left instead of right; its words stay readable. */
  readonly flip?: boolean;
}

const MOTION_CLASS: Record<RobotMotion, string> = {
  'beam-on': styles.beamOn,
  scan: styles.scan,
  dive: styles.dive,
  surface: styles.surface,
};

const facetClass = ({ tone }: RobotFacet, lampLit: boolean) =>
  tone === 'lens' ? (lampLit ? styles.lensLit : styles.lensOff) : styles[tone];

function Beam({ aim, motion }: { readonly aim: RobotAim; readonly motion?: RobotMotion }) {
  const { cone, core } = beamPoints(aim);
  return (
    <g transform={`translate(${LAMP_ORIGIN.x} ${LAMP_ORIGIN.y})`}>
      <g
        data-beam
        data-robot-part={motion && 'beam'}
        data-motion={motion}
        className={cn(styles.beam, motion && MOTION_CLASS[motion])}
      >
        <polygon points={cone} className={styles.beamCone} />
        <polygon points={core} className={styles.beamCore} />
      </g>
    </g>
  );
}

function Hull({ lampLit }: { readonly lampLit: boolean }) {
  return ROBOT_FACETS.map((facet) => (
    <polygon
      key={facet.points}
      data-part={facet.part}
      data-lens={facet.tone === 'lens' ? (lampLit ? 'lit' : 'off') : undefined}
      points={facet.points}
      className={cn(styles.facet, facetClass(facet, lampLit))}
    />
  ));
}

function Head({ mood, says, motion, flip }: Pick<RobotProps, 'mood' | 'says' | 'motion' | 'flip'>) {
  if (mood === undefined && says === undefined) return null;
  const head = robotHead(flip === true);
  return (
    <g data-head={`${head.x},${head.y}`} data-after={motion} className={styles.emote}>
      <Emote mood={mood} says={says} at={head} />
    </g>
  );
}

function Moving({
  motion,
  part,
  children,
}: {
  readonly motion?: RobotMotion;
  readonly part: string;
  readonly children: ReactNode;
}) {
  return (
    <g data-robot-part={motion && part} data-motion={motion} className={motion && MOTION_CLASS[motion]}>
      {children}
    </g>
  );
}

/**
 * The diving robot, the AI of "What lies below the waterline of sustainable AI skills" (design-ADR 0025): a low-poly
 * ROV with a float block, camera dome, search lamp and arm, about 80 by 60 units with (0, 0) at the top centre where
 * a cable would attach. An SVG group a Scene places inside its own `<svg>`, positioned by a `transform` or by
 * `Travel`. It implements the actor contract: `mood` and `says` pop in at its head anchor, above the dome, once its
 * own motion has played. Its motions stay inside the figure; moving across the Scene is `Travel`'s job.
 */
export function Robot({ motion, mood, says, lamp, aim = 'ahead', flip }: RobotProps) {
  const { lampLit, beam, beamMotion, bodyMotion } = robotLook({ motion, lamp });
  return (
    <g data-robot data-mood={mood} className={styles.figure}>
      <g data-robot-body transform={flip ? 'scale(-1 1)' : undefined}>
        <Moving motion={bodyMotion} part="whole">
          {beam && <Beam aim={aim} motion={beamMotion} />}
          <Hull lampLit={lampLit} />
        </Moving>
      </g>
      <Head mood={mood} says={says} motion={motion} flip={flip} />
    </g>
  );
}
