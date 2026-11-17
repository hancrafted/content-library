import { Character } from '@/episodes/components/slide-shared/character/character';
import type { Preset } from '@/episodes/components/slide-shared/character/preset';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Bubbles } from '@/episodes/components/slide-shared/iceberg/scenery/bubbles';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { cn } from '@/shared/lib/utils';
import { useId, type CSSProperties } from 'react';
import { Cabin, DIVE_HEIGHT, DIVE_WIDTH, DiveSea, PORTHOLE, PortRim, Silt, type DiveHalf } from './dive-art';
import styles from './dive.module.css';

export type DiveOutcome = 'short' | 'silt';
export type DiveReader = 'same-pilot' | 'other-school';
export type { DiveHalf } from './dive-art';

const otherSchool: Preset = { ...pilot, skin: 'deep', hairTone: 'grey', prop: undefined };
const READERS: Record<DiveReader, Preset> = { 'same-pilot': pilot, 'other-school': otherSchool };

const WATERLINE = 65;
const SHIP_SCALE = 0.56;
const TIP = shipAnchors().aFrameTip;
const CABLE_X = 282;
const CABLE_TOP = WATERLINE + TIP.y * SHIP_SCALE;
const SHIP_X = CABLE_X - TIP.x * SHIP_SCALE;
const ROBOT_SCALE = 0.95;
const TODAY: Record<DiveOutcome, number> = { short: 187, silt: 343 };
const YESTERDAY = { x: 164, y: 319 } as const;
const READER = { x: 4, y: 74, scale: 1.25 } as const;

const EDGE = 8;
const at = (x: number, y: number) =>
  ({
    left: `${(x / DIVE_WIDTH) * 100}%`,
    top: `${(y / DIVE_HEIGHT) * 100}%`,
    maxWidth: `${((DIVE_WIDTH - x - EDGE) / DIVE_WIDTH) * 100}%`,
  }) as CSSProperties;
const LABEL_AT: Record<DiveOutcome, CSSProperties> = { short: at(346, 263), silt: at(336, 293) };
const YESTERDAY_AT = at(116.4, 282);

function Porthole({ reader }: { readonly reader: DiveReader }) {
  const clip = useId();
  return (
    <g>
      <clipPath id={clip}>
        <circle cx={PORTHOLE.x} cy={PORTHOLE.y} r={PORTHOLE.r} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <Cabin />
        <g transform={`translate(${PORTHOLE.x + READER.x} ${PORTHOLE.y + READER.y}) scale(${READER.scale})`}>
          <Character preset={READERS[reader]} pose="sit" />
        </g>
      </g>
      <PortRim />
    </g>
  );
}

function GapBracket() {
  const d = 'M328 244h8V370h-8';
  return (
    <g aria-hidden>
      <path d={d} className={styles.gapEdge} />
      <path d={d} className={styles.gap} />
    </g>
  );
}

function Yesterday() {
  return (
    <g className={styles.ghost}>
      <path d={`M${CABLE_X} ${CABLE_TOP}Q262 216 ${YESTERDAY.x} ${YESTERDAY.y}`} className={styles.ghostCable} />
      <g transform={`translate(${YESTERDAY.x} ${YESTERDAY.y}) scale(${ROBOT_SCALE})`}>
        <Robot state={robotAt('the-model-changes-the-skill-doesn-t').state} lamp={false} />
      </g>
    </g>
  );
}

function Today({ outcome }: { readonly outcome: DiveOutcome }) {
  const y = TODAY[outcome];
  return (
    <Travel from={`0 ${-((y + 60) / DIVE_HEIGHT) * 100}%`} duration={1600} delay={200}>
      <line x1={CABLE_X} y1={CABLE_TOP} x2={CABLE_X} y2={y} className={styles.cable} />
      <Bubbles x={CABLE_X + 18} y={y - 12} count={3} scale={0.45} />
      <g transform={`translate(${CABLE_X} ${y}) scale(${ROBOT_SCALE})`}>
        <Robot state={robotAt('the-model-changes-the-skill-doesn-t').state} aim="down" />
      </g>
    </Travel>
  );
}

export interface DiveSceneProps {
  readonly half: DiveHalf;
  readonly outcome: DiveOutcome;
  readonly reader: DiveReader;
  readonly label: string;
  readonly labels: { readonly today: string; readonly yesterday: string };
}

function DiveLabels({ outcome, labels }: Pick<DiveSceneProps, 'outcome' | 'labels'>) {
  const pill = 'absolute w-max rounded-2xl px-3 py-0.5 text-caption font-semibold';
  return (
    <>
      <span className={cn(pill, styles.label)} style={LABEL_AT[outcome]}>
        {labels.today}
      </span>
      <span className={cn(pill, styles.ghostLabel)} style={YESTERDAY_AT}>
        {labels.yesterday}
      </span>
    </>
  );
}

export function DiveScene({ half, outcome, reader, label, labels }: DiveSceneProps) {
  return (
    <div role="img" aria-label={label} data-dive={outcome} data-reader={reader}>
      <ZoneScene
        zone="abyss"
        className="aspect-[4/3] w-full rounded-lg"
        overlay={
          <>
            <svg
              aria-hidden
              viewBox={`0 0 ${DIVE_WIDTH} ${DIVE_HEIGHT}`}
              className={cn(styles.art, 'absolute inset-0 size-full')}
            >
              <DiveSea half={half} />
              <Yesterday />
              {outcome === 'silt' ? <Silt className={styles.silt} /> : null}
              <Today outcome={outcome} />
              {outcome === 'short' ? <GapBracket /> : null}
              <Ship transform={`translate(${SHIP_X} ${WATERLINE}) scale(${SHIP_SCALE})`} />
              <Porthole reader={reader} />
            </svg>
            <DiveLabels outcome={outcome} labels={labels} />
          </>
        }
      />
    </div>
  );
}
