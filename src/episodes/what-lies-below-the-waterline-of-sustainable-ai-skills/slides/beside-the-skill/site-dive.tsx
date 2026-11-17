import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
  SURFACE_WATERLINE,
  ZoneScene,
} from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { cn } from '@/shared/lib/utils';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { DiveWater } from './dive-art';
import styles from './slide.module.css';

const UNITS_PER_METRE = 2.6;
const SHIP_X = 760;
const SHIP_SCALE = 1.3;
const ROBOT_SCALE = 1.6;
const ROBOT_HEIGHT = 59;
const ROBOT_HALF_WIDTH = 40;
const DESCENT = { delay: 1200, duration: 2200 } as const;

const depthY = (metres: number) => SURFACE_WATERLINE + metres * UNITS_PER_METRE;
const ANCHORS = shipAnchors();
const CABLE_X = SHIP_X + ANCHORS.aFrameTip.x * SHIP_SCALE;
const CABLE_TOP = SURFACE_WATERLINE + ANCHORS.aFrameTip.y * SHIP_SCALE;
const ROBOT_DRAWN_HEIGHT = ROBOT_HEIGHT * ROBOT_SCALE;
const START_DEPTH_M = 6;
const SEABED_RISE = 6;

export interface SiteDiveProps {
  readonly label: string;
  readonly seabedM: number;
  readonly ghostM: number;
  readonly ticks: readonly number[];
  readonly words: {
    readonly site: string;
    readonly ghost: string;
    readonly seabed: string;
    readonly reached: string;
    readonly metres: (metres: number) => string;
  };
}

const at = (x: number, y: number): CSSProperties => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / SCENE_HEIGHT) * 100}%`,
});

function Pill({ x, y, className, children }: { x: number; y: number; className?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        'absolute -translate-y-1/2 rounded-full px-3 py-0.5 text-caption font-semibold shadow-md',
        className,
      )}
      style={at(x, y)}
    >
      {children}
    </p>
  );
}

interface DiveGeometry {
  readonly seabed: number;
  readonly robotTop: number;
  readonly ghostTop: number;
  readonly startShift: number;
}

function geometryOf(seabedM: number, ghostM: number): DiveGeometry {
  const seabed = depthY(seabedM);
  const robotTop = seabed - ROBOT_DRAWN_HEIGHT + 6;
  return {
    seabed,
    robotTop,
    ghostTop: depthY(ghostM) - ROBOT_DRAWN_HEIGHT / 2,
    startShift: ((depthY(START_DEPTH_M) - robotTop) / SCENE_HEIGHT) * 100,
  };
}

function Check({ x, y, label }: { readonly x: number; readonly y: number; readonly label: string }) {
  return (
    <p
      data-motion="check"
      className={cn(
        styles.check,
        'absolute grid size-8 -translate-1/2 place-items-center rounded-full border border-foreground bg-card text-card-foreground shadow-md',
      )}
      style={at(x, y)}
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 fill-none stroke-current" strokeWidth={2.5}>
        <polyline points="3,8.5 6.5,12 13,4.5" />
      </svg>
      <span className="sr-only">{label}</span>
    </p>
  );
}

function DiveLabels({ props, at: g }: { readonly props: SiteDiveProps; readonly at: DiveGeometry }) {
  const { words, ticks, ghostM } = props;
  const beside = CABLE_X + ROBOT_HALF_WIDTH * ROBOT_SCALE;
  return (
    <>
      {ticks.map((metres) => (
        <p
          key={metres}
          className="absolute left-2 -translate-y-1/2 rounded-sm bg-card/85 px-1 text-caption font-semibold text-card-foreground"
          style={{ top: at(0, depthY(metres)).top }}
        >
          {words.metres(metres)}
        </p>
      ))}
      <Pill x={CABLE_X - 230} y={SURFACE_WATERLINE - 60} className="bg-card text-card-foreground">
        {words.site}
      </Pill>
      <Pill x={beside + 16} y={depthY(ghostM)} className="bg-card text-card-foreground">
        {words.ghost}
      </Pill>
      <Pill x={beside + 40} y={g.seabed - 16} className="bg-primary text-primary-foreground">
        {words.seabed}
      </Pill>
      <Check x={beside + 10} y={g.robotTop - 4} label={words.reached} />
    </>
  );
}

function Marks({ ticks, ghostTop }: { readonly ticks: readonly number[]; readonly ghostTop: number }) {
  return (
    <g aria-hidden>
      <g className={styles.ticks}>
        {ticks.map((metres) => (
          <line key={metres} x1={0} x2={60} y1={depthY(metres)} y2={depthY(metres)} strokeWidth={3} />
        ))}
      </g>
      <rect
        className={styles.ghost}
        x={CABLE_X - ROBOT_HALF_WIDTH * ROBOT_SCALE}
        y={ghostTop}
        width={ROBOT_HALF_WIDTH * 2 * ROBOT_SCALE}
        height={ROBOT_DRAWN_HEIGHT}
        strokeWidth={3}
        strokeDasharray="10 8"
      />
    </g>
  );
}

function Descent({ at: g }: { readonly at: DiveGeometry }) {
  const clip = useId();
  return (
    <>
      <clipPath id={clip}>
        <rect x={0} y={CABLE_TOP} width={SCENE_WIDTH} height={SCENE_HEIGHT} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <Travel from={`0 ${-g.startShift}%`} delay={DESCENT.delay} duration={DESCENT.duration}>
          <line
            className={styles.cable}
            x1={CABLE_X}
            x2={CABLE_X}
            y1={g.robotTop - SCENE_HEIGHT}
            y2={g.robotTop}
            strokeWidth={2.5}
          />
          <g transform={`translate(${CABLE_X} ${g.robotTop}) scale(${ROBOT_SCALE})`}>
            <Robot state={robotAt('beside-the-skill').state} aim="down" />
          </g>
        </Travel>
      </g>
    </>
  );
}

export function SiteDive(props: SiteDiveProps) {
  const g = geometryOf(props.seabedM, props.ghostM);
  return (
    <div data-dive data-seabed-m={props.seabedM} data-ghost-m={props.ghostM}>
      <ZoneScene
        zone="surface"
        iceberg="none"
        label={props.label}
        className="aspect-[3/2] w-full rounded-2xl shadow-md"
        overlay={<DiveLabels props={props} at={g} />}
      >
        <g className={styles.art}>
          <DiveWater
            width={SCENE_WIDTH}
            waterline={SURFACE_WATERLINE}
            bedTop={g.seabed - SEABED_RISE}
            bottom={SCENE_HEIGHT}
          />
        </g>
        <Marks ticks={props.ticks} ghostTop={g.ghostTop} />
        <Descent at={g} />
        <Ship transform={`translate(${SHIP_X} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`} />
      </ZoneScene>
    </div>
  );
}
