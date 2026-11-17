import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { cn } from '@/shared/lib/utils';
import { atSpec, SHALLOWS, SHALLOWS_ASPECT, ShallowsArt } from './shallows-art';
import { BUBBLES, CARD, NO_CARD, SHALLOWS_FACETS, SILT } from './shallows-facets';
import styles from './slide.module.css';

const SHIP_SCALE = 1.5;
const TIP = shipAnchors().aFrameTip;
const CABLE_X = atSpec(214, 0).x;
const SHIP_X = CABLE_X - TIP.x * SHIP_SCALE;
const CABLE_TOP = SHALLOWS.waterline + TIP.y * SHIP_SCALE;
const ROBOT_SCALE = 2;
const ROBOT_HEIGHT = 116;
const BED = SHALLOWS.bed;
const HOVER = BED - atSpec(0, 236).y;
const GAUGE_X = atSpec(288, 0).x;

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
  readonly label: string;
  readonly gauge: string;
  readonly pills: { readonly card: { readonly chat: string; readonly coding: string }; readonly silt?: string };
}

const PILL = 'absolute rounded-full bg-card px-2.5 py-0.5 text-caption font-semibold text-card-foreground shadow-md';

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

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
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
        <ToneFacets facets={SHALLOWS_FACETS} />
        <ToneFacets facets={withSkill ? CARD : NO_CARD} />
      </ShallowsArt>
      <line x1={CABLE_X} y1={CABLE_TOP} x2={CABLE_X} y2={robotTop} strokeWidth={3} className={styles.cable} />
      <Ship transform={`translate(${SHIP_X} ${SHALLOWS.waterline}) scale(${SHIP_SCALE})`} />
      {withSkill ? <Gauge label={gauge} top={robotTop + ROBOT_HEIGHT} /> : null}
      <g transform={`translate(${CABLE_X} ${robotTop}) scale(${ROBOT_SCALE})${withSkill ? '' : ' rotate(-8)'}`}>
        <Robot state={robotAt('does-the-skill-make-things-better').state} aim="down" />
      </g>
      <ShallowsArt>
        <ToneFacets facets={withSkill ? BUBBLES : SILT} />
      </ShallowsArt>
    </ZoneScene>
  );
}

export function runClass(focal: boolean) {
  return cn(
    'card-hover card-hover--raise flex flex-col gap-3 rounded-xl p-4 shadow-md',
    focal && 'ring-2 ring-primary',
  );
}
