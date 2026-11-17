import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { Art } from '../art/art';
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
  type RobotState,
} from './robot.pure';

export type { RobotAim, RobotMotion, RobotState } from './robot.pure';

export interface RobotProps extends ActorProps {
  readonly motion?: RobotMotion;
  readonly lamp?: boolean;
  readonly aim?: RobotAim;
  readonly flip?: boolean;
  readonly state?: RobotState;
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
        <Art name={`robot/beam-${aim}`}>
          <polygon points={cone} className={styles.beamCone} />
          <polygon points={core} className={styles.beamCore} />
        </Art>
      </g>
    </g>
  );
}

function Hull({ lampLit }: { readonly lampLit: boolean }) {
  return (
    <Art name={`robot/hull-lamp-${lampLit ? 'lit' : 'off'}`}>
      {ROBOT_FACETS.map((facet) => (
        <polygon
          key={facet.points}
          data-part={facet.part}
          data-lens={facet.tone === 'lens' ? (lampLit ? 'lit' : 'off') : undefined}
          points={facet.points}
          className={cn(styles.facet, facetClass(facet, lampLit))}
        />
      ))}
    </Art>
  );
}

function Head({ mood, says, motion, flip }: Pick<RobotProps, 'mood' | 'says' | 'motion' | 'flip'>) {
  if (mood === undefined && says === undefined) return null;
  const head = robotHead(flip === true);
  return (
    <g data-head={`${head.x},${head.y}`} data-after={motion} className={styles.emote}>
      <Emote mood={mood} says={says} at={head} facing={flip ? 'left' : 'right'} />
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

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export function Robot({ motion, mood, says, lamp, aim = 'ahead', flip, state }: RobotProps) {
  const { lampLit, beam, beamMotion, bodyMotion } = robotLook({ motion, lamp });
  return (
    <g data-robot data-robot-state={state} data-mood={mood} className={styles.figure}>
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
