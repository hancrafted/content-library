import { Character } from '@/episodes/components/slide-shared/character/character';
import type { Preset } from '@/episodes/components/slide-shared/character/preset';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE, ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import { useId, type CSSProperties } from 'react';
import styles from './dive.module.css';

export type DiveOutcome = 'short' | 'silt';
export type DiveReader = 'same-pilot' | 'other-school';

/** A pilot from another school: the same trade, a different person. Appearance only, as presets are. */
const otherSchool: Preset = { ...pilot, skin: 'deep', hairTone: 'grey', prop: undefined };
const READERS: Record<DiveReader, Preset> = { 'same-pilot': pilot, 'other-school': otherSchool };

const SHIP_X = 700;
const TIP = shipAnchors().aFrameTip;
/** The cable's line from the A-frame down, in the Scene's 1200 by 800 units. */
const CABLE_X = SHIP_X + TIP.x;
const ROBOT_SCALE = 1.8;
/** The Abyss strip shows the drawing's lower half, from y 400; the seabed lies at 690. */
const STRIP_TOP = 400;
/** Where each dive ends, the robot's top: short of the seabed, or down in it; yesterday's always at the same point. */
const TODAY: Record<DiveOutcome, { readonly x: number; readonly y: number }> = {
  short: { x: CABLE_X, y: 470 },
  silt: { x: CABLE_X, y: 600 },
};
const YESTERDAY = { x: 500, y: 588 };

/** Where an HTML label sits over the Abyss strip, as percentages of its box. */
const at = (x: number, y: number) =>
  ({ left: `${(x / 1200) * 100}%`, top: `${((y - STRIP_TOP) / 400) * 100}%` }) as CSSProperties;

/** The reader in a porthole on deck: the pilot's head and shoulders behind round glass. */
function Porthole({ reader }: { readonly reader: DiveReader }) {
  const clip = useId();
  return (
    <g transform="translate(170 455)">
      <clipPath id={clip}>
        <circle r={110} />
      </clipPath>
      <circle r={110} className={styles.cabin} />
      <g clipPath={`url(#${clip})`}>
        <g transform="translate(0 200) scale(2.5)">
          <Character preset={READERS[reader]} />
        </g>
      </g>
      <circle r={119} className={styles.rim} />
      <circle r={110} className={styles.rimLit} />
    </g>
  );
}

/** The silt cloud the robot stirs up where it hits the seabed. */
function SiltCloud() {
  return (
    <g transform="translate(-60 0)" className={styles.silt} aria-hidden>
      <polygon data-tone="silt" points="640,700 670,640 720,620 760,650 740,700" />
      <polygon data-tone="silt-lit" points="700,700 730,630 790,610 840,640 850,700" />
      <polygon data-tone="silt" points="780,700 810,650 870,645 900,700" />
      <polygon data-tone="silt-lit" points="600,700 625,668 660,672 670,700" />
    </g>
  );
}

/** How far short the dive stops: a bracket from the robot down to yesterday's depth. */
function GapBracket() {
  const bottom = TODAY.short.y + 105;
  return <path aria-hidden d={`M 770 ${bottom} h 20 V ${YESTERDAY.y + 100} h -20`} className={styles.gap} />;
}

export interface DiveSceneProps {
  readonly outcome: DiveOutcome;
  readonly reader: DiveReader;
  readonly label: string;
  readonly labels: { readonly today: string; readonly yesterday: string };
}

/** The Surface strip, cropped around the waterline: the ship, its cable going down, the reader in the porthole. */
function SurfaceStrip({ reader }: { readonly reader: DiveReader }) {
  return (
    <div className="relative aspect-[3/1] overflow-hidden rounded-t-lg">
      <ZoneScene zone="surface" iceberg="none" className="-mt-[20.8%] aspect-[3/2] w-full">
        <line x1={CABLE_X} y1={SURFACE_WATERLINE + TIP.y} x2={CABLE_X} y2={800} className={styles.cable} />
        <Ship transform={`translate(${SHIP_X} ${SURFACE_WATERLINE})`} />
        <Porthole reader={reader} />
      </ZoneScene>
    </div>
  );
}

/** The words on the Abyss strip: where today's dive ended, and yesterday's. */
function DiveLabels({ outcome, labels }: Pick<DiveSceneProps, 'outcome' | 'labels'>) {
  const today = TODAY[outcome];
  const pill = 'absolute rounded-full px-2 text-caption whitespace-nowrap';
  return (
    <>
      <span className={cn(pill, styles.label)} style={at(today.x + 60, today.y - 40)}>
        {labels.today}
      </span>
      <span
        className={cn(pill, '-translate-x-full', styles.label, styles.ghostLabel)}
        style={at(YESTERDAY.x - 50, YESTERDAY.y - 20)}
      >
        {labels.yesterday}
      </span>
    </>
  );
}

/**
 * One of the two dives (Option 24a): the ship at the Surface with the reader in its porthole, the cable paying out into
 * the Abyss, yesterday's dive dashed at the seabed and today's ending short of it or in the silt. Two `ZoneScene`
 * strips, Surface over Abyss, at one width, so the cable runs on from one into the other.
 */
export function DiveScene({ outcome, reader, label, labels }: DiveSceneProps) {
  const today = TODAY[outcome];
  return (
    <div role="img" aria-label={label} data-dive={outcome} data-reader={reader} className={styles.dive}>
      <SurfaceStrip reader={reader} />
      <ZoneScene
        zone="abyss"
        className="aspect-[3/1] w-full rounded-b-lg"
        overlay={<DiveLabels outcome={outcome} labels={labels} />}
      >
        <g className={styles.ghost}>
          <path d={`M ${CABLE_X} ${STRIP_TOP} L ${YESTERDAY.x} ${YESTERDAY.y}`} className={styles.ghostCable} />
          <g transform={`translate(${YESTERDAY.x} ${YESTERDAY.y}) scale(${ROBOT_SCALE})`}>
            <Robot lamp={false} />
          </g>
        </g>
        <Travel from={`0 ${-((today.y - STRIP_TOP + 120) / 800) * 100}%`} duration={1600} delay={200}>
          <line x1={today.x} y1={0} x2={today.x} y2={today.y} className={styles.cable} />
          <g transform={`translate(${today.x} ${today.y}) scale(${ROBOT_SCALE})`}>
            <Robot aim="down" />
          </g>
        </Travel>
        {outcome === 'silt' ? <SiltCloud /> : <GapBracket />}
      </ZoneScene>
    </div>
  );
}
