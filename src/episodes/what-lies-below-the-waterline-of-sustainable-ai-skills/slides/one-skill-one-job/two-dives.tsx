import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Seabed } from '@/episodes/components/slide-shared/iceberg/scenery/seabed';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { DESCENT_MS, LATE_DELAY } from './motion';
import styles from './one-job.module.css';

/*
 * The water column of Spec Option 15b, in `ZoneScene`'s 1200 by 800 space at the Surface: two research ships on the
 * waterline, each lowering its robot by the same card. At site 4 the shelf lies at 40 m and the robot reaches it; at
 * site 7 the seabed lies at 120 m and the robot stops at 40, the "80 m short" bracket beside it. The robots descend
 * together once (`Travel`), then the bracket draws. The ships, robots and seabed are shared figures (design-ADR 0025);
 * the shelf is stacked from the shared seabed, and the ruler, bracket and leaders are this Slide's own.
 */

/** Scene units per metre: the waterline at 0 m, the deep seabed at 120 m. */
const PER_METRE = 3;
const depthY = (metres: number) => SURFACE_WATERLINE + metres * PER_METRE;
const SHELF_Y = depthY(40);
const DEEP_Y = depthY(120);
const SHIP_SCALE = 1.2;
const ROBOT_SCALE = 1.3;
/** The robot is about 60 units tall: its top hangs this far above where its skids touch. */
const ROBOT_HEIGHT = 60 * ROBOT_SCALE;
const ROBOT_TOP = SHELF_Y - ROBOT_HEIGHT;
const TICKS = [0, 40, 80, 120] as const;
/** Each robot starts this far up its cable, as a share of the Scene. */
const DESCENT_FROM = '0 -14%';

const ANCHORS = shipAnchors();

export const SITES = [
  { slug: 'four', x: 330, reaches: true },
  { slug: 'seven', x: 900, reaches: false },
] as const;

const tipOf = (shipX: number) => ({
  x: shipX + ANCHORS.aFrameTip.x * SHIP_SCALE,
  y: SURFACE_WATERLINE + ANCHORS.aFrameTip.y * SHIP_SCALE,
});

interface TagProps {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  /** What the label names, for readers of the drawing: a site or the shortfall. */
  readonly mark?: 'site' | 'short';
}

/**
 * A small label on its own paper, so it reads on water and sky alike; scaled up in a narrow column (`.tag`). The
 * shortfall's pill fills `primary`, as the Option draws it.
 */
function Tag({ x, y, text, mark }: TagProps) {
  const width = text.length * 8 + 16;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={styles.tag}>
        <rect x={0} y={-15} width={width} height={22} rx={11} data-tone={mark === 'short' ? 'tag-focal' : 'tag'} />
        <text
          x={8}
          y={1}
          data-ink={mark === 'short' ? 'tag-focal' : 'tag'}
          data-site={mark === 'site' ? '' : undefined}
          data-short={mark === 'short' ? '' : undefined}
          className="text-caption font-semibold"
        >
          {text}
        </text>
      </g>
    </g>
  );
}

/** The shelf under site 4: a faceted rock body falling away towards site 7, the shared seabed along its top. */
function Shelf() {
  const top = SHELF_Y + 24;
  return (
    <g data-shelf>
      <polygon points={`0,${top} 560,${top} 690,800 0,800`} data-tone="rock" />
      <polygon points={`0,${top} 300,${top} 0,700`} data-tone="rock-lit" />
      <polygon points={`560,${top} 690,800 470,800`} data-tone="rock-shade" />
      <polygon points={`180,800 360,620 520,800`} data-tone="rock-shade" />
      <Seabed y={SHELF_Y} width={600} />
    </g>
  );
}

/** The depth ruler at the left edge, 0 to 120 m. */
function Ruler({ label }: { readonly label: (metres: number) => string }) {
  return TICKS.map((metres) => (
    <g key={metres}>
      <line x1={0} x2={26} y1={depthY(metres)} y2={depthY(metres)} strokeWidth={4} data-tone="tick" />
      <Tag x={32} y={depthY(metres) + 6} text={label(metres)} />
    </g>
  ));
}

/** The cable from the A-frame and the robot descending it; site 4's touches the shelf, site 7's stops short. */
function Dive({ x, reaches }: { readonly x: number; readonly reaches: boolean }) {
  const tip = tipOf(x);
  return (
    <>
      <line x1={tip.x} y1={tip.y} x2={tip.x} y2={ROBOT_TOP} strokeWidth={3} data-tone="cable" />
      <Travel from={DESCENT_FROM} duration={DESCENT_MS}>
        <g transform={`translate(${tip.x} ${ROBOT_TOP}) scale(${ROBOT_SCALE})`}>
          <Robot motion="dive" aim="down" mood={reaches ? 'happy' : 'confused'} />
        </g>
      </Travel>
    </>
  );
}

/** The "80 m short" bracket beside site 7's robot, from 40 m down to the seabed, drawn last. */
function ShortBracket({ x, text }: { readonly x: number; readonly text: string }) {
  const bx = tipOf(x).x + 70;
  return (
    <g data-motion="late" className={styles.late} style={LATE_DELAY}>
      <line
        x1={tipOf(x).x}
        x2={bx}
        y1={SHELF_Y}
        y2={SHELF_Y}
        strokeWidth={3}
        strokeDasharray="8 6"
        data-tone="bracket-halo"
      />
      <path d={`M${bx - 10} ${SHELF_Y}H${bx}V${DEEP_Y}H${bx - 10}`} strokeWidth={10} data-tone="bracket-halo" />
      <path d={`M${bx - 10} ${SHELF_Y}H${bx}V${DEEP_Y}H${bx - 10}`} strokeWidth={5} data-tone="bracket" />
      <Tag x={bx + 16} y={(SHELF_Y + DEEP_Y) / 2} text={text} mark="short" />
    </g>
  );
}

/** Dashed leaders from the card in the sky down to both ships: one skill, two dives. */
function Leaders() {
  return SITES.map(({ slug, x }) => (
    <line
      key={slug}
      x1={600}
      y1={250}
      x2={x}
      y2={SURFACE_WATERLINE - 50}
      strokeWidth={3}
      strokeDasharray="10 8"
      data-tone="leader"
    />
  ));
}

export interface TwoDivesProps {
  readonly sites: Readonly<Record<(typeof SITES)[number]['slug'], string>>;
  readonly short: string;
  readonly depth: (metres: number) => string;
}

/** Both dives under one card, as children of a Surface `ZoneScene`. */
export function TwoDives({ sites, short, depth }: TwoDivesProps) {
  return (
    <g className={styles.dives}>
      <Seabed y={DEEP_Y - 10} />
      <Shelf />
      <Leaders />
      {SITES.map(({ slug, x, reaches }) => (
        <g key={slug}>
          <Dive x={x} reaches={reaches} />
          <Ship transform={`translate(${x} ${SURFACE_WATERLINE}) scale(${SHIP_SCALE})`} />
          <Tag x={x + 40} y={SURFACE_WATERLINE + 50} text={sites[slug]} mark="site" />
        </g>
      ))}
      <ShortBracket x={SITES[1].x} text={short} />
      <Ruler label={depth} />
    </g>
  );
}
