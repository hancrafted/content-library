import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { DESCENT_MILLISECONDS, LATE_DELAY } from './motion';
import styles from './one-job.module.css';
import { depthY, sceneX, WaterColumnArt } from './water-column-art';

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
const SHELF_Y = depthY(40);
const DEEP_Y = depthY(120);
const SHIP_SCALE = 1.2;
const ROBOT_SCALE = 1.3;
const ROBOT_HEIGHT = 60 * ROBOT_SCALE;
const ROBOT_TOP = SHELF_Y - ROBOT_HEIGHT;
const TICKS = [0, 40, 80, 120] as const;
const DESCENT_FROM = '0 -14%';

const ANCHORS = shipAnchors();

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
  readonly mark?: 'site' | 'short';
}

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

function Ruler({ label }: { readonly label: (metres: number) => string }) {
  return TICKS.map((metres) => (
    <g key={metres}>
      <line x1={0} x2={26} y1={depthY(metres)} y2={depthY(metres)} strokeWidth={4} data-tone="tick" />
      <Tag x={32} y={depthY(metres) + 6} text={label(metres)} />
    </g>
  ));
}

function Check({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-check transform={`translate(${x} ${y})`}>
      <circle r={20} strokeWidth={3.5} data-tone="check-disc" />
      <path d="M-9 0l6 6.5 12-13" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" data-tone="check-mark" />
    </g>
  );
}

function Bubbles({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} data-tone="bubble">
      <polygon points="9,0 4.5,-7.8 -4.5,-7.8 -9,0 -4.5,7.8 4.5,7.8" />
      <polygon points="21,-22 17.5,-28 10.5,-28 7,-22 10.5,-16 17.5,-16" transform="translate(-4 -2)" />
      <polygon points="5,-46 2.5,-50 -2.5,-50 -5,-46 -2.5,-42 2.5,-42" />
    </g>
  );
}

function Dive({ x, reaches }: { readonly x: number; readonly reaches: boolean }) {
  const tip = tipOf(x);
  return (
    <>
      <line x1={tip.x} y1={tip.y} x2={tip.x} y2={ROBOT_TOP} strokeWidth={3} data-tone="cable" />
      <Travel from={DESCENT_FROM} duration={DESCENT_MILLISECONDS}>
        <g transform={`translate(${tip.x} ${ROBOT_TOP}) scale(${ROBOT_SCALE})`}>
          <Robot
            state={robotAt('one-skill-one-job').state}
            motion="dive"
            aim="down"
            mood={reaches ? 'happy' : 'confused'}
          />
        </g>
        {reaches ? <Check x={tip.x + 66} y={ROBOT_TOP + 40} /> : <Bubbles x={tip.x + 36} y={ROBOT_TOP - 30} />}
      </Travel>
    </>
  );
}

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
