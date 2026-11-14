import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { cn } from '@/shared/lib/utils';
import { atSpec, Facets, SHALLOWS, SHALLOWS_ASPECT, ShallowsArt } from './shallows-art';
import { BUBBLES, CARD, NO_CARD, SHALLOWS_FACETS, SILT } from './shallows-facets';
import styles from './slide.module.css';

/** The ship's size, and its A-frame over the Spec's cable, where the robot of Option 22a hangs. */
const SHIP_SCALE = 1.5;
const TIP = shipAnchors().aFrameTip;
const CABLE_X = atSpec(214, 0).x;
const SHIP_X = CABLE_X - TIP.x * SHIP_SCALE;
const CABLE_TOP = SHALLOWS.waterline + TIP.y * SHIP_SCALE;
const ROBOT_SCALE = 2;
/** The robot's drawn height at its scale: from its bail to the claw. */
const ROBOT_HEIGHT = 116;
const BED = SHALLOWS.bed;
/** Two metres above the seabed, drawn: where the with-skill run holds the robot, the Spec's claw at 236 over 280. */
const HOVER = BED - atSpec(0, 236).y;
/** The gauge stands beside the hovering robot, where the Spec draws it. */
const GAUGE_X = atSpec(288, 0).x;

/** Two metres above the seabed, measured: the line beside the hovering robot. */
function Gauge({ label, top }: { readonly label: string; readonly top: number }) {
  return (
    <g aria-hidden className={styles.gauge}>
      <line x1={GAUGE_X} y1={top} x2={GAUGE_X} y2={BED} strokeWidth={4} strokeDasharray="8 8" />
      <line x1={GAUGE_X - 16} y1={top} x2={GAUGE_X + 16} y2={top} strokeWidth={4} />
      <line x1={GAUGE_X - 16} y1={BED} x2={GAUGE_X + 16} y2={BED} strokeWidth={4} />
      <text x={GAUGE_X + 30} y={(top + BED) / 2 + 20} className="text-heading font-semibold">
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
      {pills.silt === undefined ? null : <span className={cn(PILL, 'right-[3%] bottom-[4%]')}>{pills.silt}</span>}
    </>
  );
}

/**
 * One test dive in shallow water (Option 22a): the ship with the robot on its cable over the same site, in the Spec's
 * faceted sky, water and seabed (`shallows-art.tsx`). Without the skill the robot settles into the seabed and stirs up
 * the sediment, the card's place empty; with it the robot holds 2 m above the site, bubbles rising, and the written
 * procedure card sits at the upper left. The ship and robot are the shared cast (design-ADR 0025).
 */
export function TestDive({ run, label, gauge, pills }: TestDiveProps) {
  const withSkill = run === 'with';
  const robotTop = withSkill ? BED - HOVER - ROBOT_HEIGHT : BED - ROBOT_HEIGHT + 16;
  return (
    <ZoneScene
      zone="surface"
      iceberg="none"
      label={label}
      className={cn(SHALLOWS_ASPECT, 'w-full rounded-lg')}
      overlay={<DivePills pills={pills} />}
    >
      <ShallowsArt>
        <Facets facets={SHALLOWS_FACETS} />
        <Facets facets={withSkill ? CARD : NO_CARD} />
      </ShallowsArt>
      <line x1={CABLE_X} y1={CABLE_TOP} x2={CABLE_X} y2={robotTop} strokeWidth={3} className={styles.cable} />
      <Ship transform={`translate(${SHIP_X} ${SHALLOWS.waterline}) scale(${SHIP_SCALE})`} />
      {withSkill ? <Gauge label={gauge} top={robotTop + ROBOT_HEIGHT} /> : null}
      <g transform={`translate(${CABLE_X} ${robotTop}) scale(${ROBOT_SCALE})${withSkill ? '' : ' rotate(-8)'}`}>
        <Robot state={robotAt('does-the-skill-make-things-better').state} aim="down" />
      </g>
      <ShallowsArt>
        <Facets facets={withSkill ? BUBBLES : SILT} />
      </ShallowsArt>
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
