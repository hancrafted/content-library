import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { DESCENT_MS, LATE_DELAY } from './motion';
import styles from './one-job.module.css';
import { depthY, sceneX, WaterColumnArt } from './water-column-art';

/*
 * The two dives of Spec Option 15b, in `ZoneScene`'s 1200 by 800 space at the Surface: two research ships on the
 * waterline, each lowering its robot by the same card. At site 4 the shelf lies at 40 m and the robot reaches it; at
 * site 7 the seabed lies at 120 m and the robot stops at 40, the "80 m short" bracket beside it. The robots descend
 * together once (`Travel`), then the bracket draws. The water, shelf and seabed are this Slide's own, lifted from the
 * Option (`water-column-art.tsx`, feedback 3, decision 46); the ships and robots are shared figures (design-ADR 0025);
 * the ruler, bracket, check mark, bubbles and leaders are this Slide's own.
 */

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

/** Each ship's place, so its A-frame hangs the cable where the Option's does: over the shelf, and over the deep. */
const shipAt = (specCable: number) => sceneX(specCable) - ANCHORS.aFrameTip.x * SHIP_SCALE;
export const SITES = [
  { slug: 'four', x: shipAt(97.5), reaches: true },
  { slug: 'seven', x: shipAt(507.5), reaches: false },
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

/** The depth ruler at the left edge, 0 to 120 m. */
function Ruler({ label }: { readonly label: (metres: number) => string }) {
  return TICKS.map((metres) => (
    <g key={metres}>
      <line x1={0} x2={26} y1={depthY(metres)} y2={depthY(metres)} strokeWidth={4} data-tone="tick" />
      <Tag x={32} y={depthY(metres) + 6} text={label(metres)} />
    </g>
  ));
}

/** The check mark on the robot that reached the shelf, as the Option draws it. */
function Check({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-check transform={`translate(${x} ${y})`}>
      <circle r={20} strokeWidth={3.5} data-tone="check-disc" />
      <path d="M-9 0l6 6.5 12-13" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" data-tone="check-mark" />
    </g>
  );
}

/** Three small faceted bubbles rising from the robot left hanging, as the Option draws them. */
function Bubbles({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} data-tone="bubble">
      <polygon points="9,0 4.5,-7.8 -4.5,-7.8 -9,0 -4.5,7.8 4.5,7.8" />
      <polygon points="21,-22 17.5,-28 10.5,-28 7,-22 10.5,-16 17.5,-16" transform="translate(-4 -2)" />
      <polygon points="5,-46 2.5,-50 -2.5,-50 -5,-46 -2.5,-42 2.5,-42" />
    </g>
  );
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
        {reaches ? <Check x={tip.x + 66} y={ROBOT_TOP + 40} /> : <Bubbles x={tip.x + 36} y={ROBOT_TOP - 30} />}
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

/** Dashed curves from the card's lower corners to both ships' mastheads: one skill, two dives. */
function Leaders() {
  return SITES.map(({ slug, x }, index) => {
    const from = { x: index === 0 ? 450 : 750, y: 300 };
    const to = { x: x + ANCHORS.pennant.x * SHIP_SCALE, y: SURFACE_WATERLINE + ANCHORS.pennant.y * SHIP_SCALE - 6 };
    const bend = index === 0 ? -90 : 90;
    return (
      <path
        key={slug}
        d={`M${from.x} ${from.y} C${from.x + bend} ${from.y + 30} ${to.x - bend / 3} ${to.y - 40} ${to.x} ${to.y}`}
        strokeWidth={3}
        strokeDasharray="8 9"
        data-tone="leader"
      />
    );
  });
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
      <WaterColumnArt />
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
