import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { SURFACE_WATERLINE, ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

/** The ship's place on the waterline and its size in the Scene's 1200 by 800 space. */
const SHIP = { x: 760, scale: 1.5 };
const ROBOT_SCALE = 2;
/** The robot's drawn height at its scale: from its bail to the claw. */
const ROBOT_HEIGHT = 116;
/** The shallow seabed's top. */
const BED = 690;
/** Two metres above the seabed, drawn: where the with-skill run holds the robot. */
const HOVER = 100;

const TIP = shipAnchors().aFrameTip;
const CABLE_X = SHIP.x + TIP.x * SHIP.scale;
const CABLE_TOP = SURFACE_WATERLINE + TIP.y * SHIP.scale;

/** The shallow seabed, faceted, with two rocks: the site the robot samples. */
function Shallows() {
  return (
    <g aria-hidden className={styles.bed}>
      <polygon data-tone="bed-lit" points={`0,${BED} 420,${BED - 14} 520,${BED + 6} 300,800 0,800`} />
      <polygon data-tone="bed" points={`420,${BED - 14} 820,${BED + 4} 900,800 300,800 520,${BED + 6}`} />
      <polygon data-tone="bed-shade" points={`820,${BED + 4} 1200,${BED - 10} 1200,800 900,800`} />
      <polygon data-tone="rock" points={`90,${BED + 4} 130,${BED - 40} 180,${BED - 30} 200,${BED + 6}`} />
      <polygon data-tone="rock-lit" points={`130,${BED - 40} 150,${BED - 8} 90,${BED + 4}`} />
      <polygon data-tone="rock" points={`960,${BED} 1010,${BED - 50} 1060,${BED - 20} 1080,${BED + 4}`} />
      <polygon data-tone="rock-lit" points={`1010,${BED - 50} 1020,${BED - 6} 960,${BED}`} />
    </g>
  );
}

/** The cloud of sediment the robot stirs up when it settles into the seabed. */
function Silt() {
  return (
    <g aria-hidden className={styles.silt}>
      <polygon
        data-tone="silt"
        points={`${CABLE_X - 150},${BED} ${CABLE_X - 90},${BED - 70} ${CABLE_X - 20},${BED - 40} ${CABLE_X - 40},${BED + 10}`}
      />
      <polygon
        data-tone="silt-lit"
        points={`${CABLE_X - 60},${BED} ${CABLE_X + 10},${BED - 90} ${CABLE_X + 90},${BED - 50} ${CABLE_X + 70},${BED + 12}`}
      />
      <polygon
        data-tone="silt"
        points={`${CABLE_X + 40},${BED} ${CABLE_X + 120},${BED - 60} ${CABLE_X + 190},${BED - 20} ${CABLE_X + 150},${BED + 10}`}
      />
    </g>
  );
}

/** The procedure card at the upper left, or its empty place where the run has none. */
function ProcedureCard({ present }: { readonly present: boolean }) {
  if (!present) {
    return (
      <rect
        aria-hidden
        x={70}
        y={170}
        width={130}
        height={170}
        rx={6}
        strokeWidth={4}
        strokeDasharray="10 8"
        className={styles.ghost}
      />
    );
  }
  return (
    <g aria-hidden className={styles.card}>
      <polygon data-tone="paper-shade" points="78,178 210,170 214,346 82,352" />
      <polygon data-tone="paper" points="70,172 200,164 204,340 74,346" />
      {[0, 1, 2, 3, 4].map((line) => (
        <rect key={line} data-tone="ink" x={90} y={200 + line * 26} width={line === 0 ? 90 : 76} height={6} rx={3} />
      ))}
    </g>
  );
}

/** Two metres above the seabed, measured: the line under the hovering robot. */
function Gauge({ label, top }: { readonly label: string; readonly top: number }) {
  return (
    <g aria-hidden className={styles.gauge}>
      <line x1={CABLE_X} y1={top} x2={CABLE_X} y2={BED} strokeWidth={4} strokeDasharray="8 8" />
      <line x1={CABLE_X - 16} y1={BED} x2={CABLE_X + 16} y2={BED} strokeWidth={4} />
      <text x={CABLE_X + 60} y={(top + BED) / 2 + 20} className="text-heading font-semibold">
        {label}
      </text>
    </g>
  );
}

export interface TestDiveProps {
  readonly run: 'without' | 'with';
  /** Words for the drawing. */
  readonly label: string;
  readonly gauge: string;
  /** The pills over the drawing: the card or its absence, and what the run stirred up. */
  readonly pills: { readonly card: { readonly chat: string; readonly coding: string }; readonly silt?: string };
}

const PILL = 'absolute rounded-full bg-card px-2.5 py-0.5 text-caption font-semibold text-card-foreground shadow-md';

/** The pills over the drawing: the card or its absence at the upper left, and the stirred-up silt. */
function DivePills({ pills }: Pick<TestDiveProps, 'pills'>) {
  return (
    <>
      <span className={cn(PILL, 'top-[7%] left-[13%]')}>
        <InView view="chat">{pills.card.chat}</InView>
        <InView view="coding" className="font-mono">
          {pills.card.coding}
        </InView>
      </span>
      {pills.silt === undefined ? null : <span className={cn(PILL, 'right-[4%] bottom-[16%]')}>{pills.silt}</span>}
    </>
  );
}

/**
 * One test dive in shallow water (Option 22a): the ship with the robot on its cable over the same site. Without the
 * skill the robot settles into the seabed and stirs up the sediment, the card's place empty; with it the robot holds
 * 2 m above the site and the procedure card sits at the upper left. The ship, robot and Scene are the shared cast
 * (design-ADR 0025); the seabed, silt, card and gauge are this Slide's own.
 */
export function TestDive({ run, label, gauge, pills }: TestDiveProps) {
  const withSkill = run === 'with';
  const robotTop = withSkill ? BED - HOVER - ROBOT_HEIGHT : BED - ROBOT_HEIGHT + 16;
  return (
    <ZoneScene
      zone="surface"
      iceberg="none"
      label={label}
      className="aspect-video w-full rounded-lg"
      overlay={<DivePills pills={pills} />}
    >
      <Shallows />
      <ProcedureCard present={withSkill} />
      <line x1={CABLE_X} y1={CABLE_TOP} x2={CABLE_X} y2={robotTop} strokeWidth={3} className={styles.cable} />
      <Ship transform={`translate(${SHIP.x} ${SURFACE_WATERLINE}) scale(${SHIP.scale})`} />
      {withSkill ? <Gauge label={gauge} top={robotTop + ROBOT_HEIGHT} /> : null}
      <g transform={`translate(${CABLE_X} ${robotTop}) scale(${ROBOT_SCALE})${withSkill ? '' : ' rotate(-8)'}`}>
        <Robot aim="down" />
      </g>
      {withSkill ? null : <Silt />}
    </ZoneScene>
  );
}

/** The two runs' card frame: label and sub-line, then the dive, then the score. */
export function runClass(focal: boolean) {
  return cn(
    'card-hover card-hover--raise flex flex-col gap-3 rounded-xl p-4 shadow-md',
    focal && 'ring-2 ring-primary',
  );
}
