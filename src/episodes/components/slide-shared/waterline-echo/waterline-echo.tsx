import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { InView } from '../agent-view/in-view';
import { Robot } from '../deep-sea-expedition/robot';
import { Ship } from '../deep-sea-expedition/ship';
import { shipAnchors } from '../deep-sea-expedition/ship.pure';
import { DepthRuler, type ZoneWords } from '../iceberg/depth-ruler';
import type { Zone } from '../iceberg/ruler.pure';
import { ZoneCard } from '../iceberg/zone-card';
import { SURFACE_WATERLINE, ZoneScene } from '../iceberg/zone-scene';
import { WATERLINE_SECTIONS } from './depth';

/** Where the robot sits in a section slide's scene: on deck, just over the water, on its cable, or on the seabed. */
export type RobotAt = 'deck' | 'surface' | 'hanging' | 'seabed';

export interface WaterlineEchoProps {
  /** The Section's place among the eight, from 0: its zone, its lit tile on the ruler. */
  readonly section: number;
  /** The five zones' words, for the ruler and the zone over the card. */
  readonly zones: ZoneWords;
  /** The ruler's name for assistive tech: `Depth ruler, What a skill is lit`. */
  readonly rulerLabel: string;
  readonly robotAt: RobotAt;
  /** A small label over the card's statement, such as "AI model". */
  readonly tag?: string;
  /** The AI statement the card leads with. */
  readonly statement: string;
  /** The analogy line of the default chat-app view. */
  readonly chat: string;
  /** The file line of the coding-agent view. */
  readonly coding: string;
  /** The card's tilt, one way or the other, as the mocks set each card down. */
  readonly tilt?: 'left' | 'right';
  /** A wider card for a Section whose card carries a drawing. */
  readonly wide?: boolean;
  /** Words outside the card, over it, such as the project file's tab. */
  readonly above?: ReactNode;
  /** The card's drawing between the statement and the view lines. */
  readonly children?: ReactNode;
}

const SHIP_X = 760;
/** Below the Surface the robot hangs mid-Scene, clear of the card on the left and the ruler on the right. */
const DIVE_X = 600;
const DEPTH: Record<'hanging' | 'seabed', number> = { hanging: 470, seabed: 600 };
const ROBOT_SCALE = 1.8;

/** The cable the robot hangs on, from `top` down to its bail. */
function Cable({ x, top, bottom }: { readonly x: number; readonly top: number; readonly bottom: number }) {
  return <line x1={x} y1={top} x2={x} y2={bottom} strokeWidth={3} className="stroke-foreground/50" />;
}

/** The robot at its depth, on its cable from the ship's A-frame or from above the Scene. */
function Dive({ at, surface }: { readonly at: RobotAt; readonly surface: boolean }) {
  const anchors = shipAnchors();
  const robot = <Robot aim={at === 'deck' ? 'ahead' : 'down'} lamp={at !== 'deck'} />;
  const scaled = (x: number, y: number) => <g transform={`translate(${x} ${y}) scale(${ROBOT_SCALE})`}>{robot}</g>;
  if (surface) {
    return (
      <Ship
        rock
        transform={`translate(${SHIP_X} ${SURFACE_WATERLINE})`}
        deck={
          at === 'deck' ? (
            <g transform={`translate(${anchors.robot.x} ${anchors.robot.y - 60}) scale(0.8)`}>{robot}</g>
          ) : (
            <>
              <Cable x={anchors.aFrameTip.x} top={anchors.aFrameTip.y} bottom={-70} />
              <g transform={`translate(${anchors.aFrameTip.x} -70) scale(0.9)`}>{robot}</g>
            </>
          )
        }
      />
    );
  }
  const depth = DEPTH[at === 'seabed' ? 'seabed' : 'hanging'];
  return (
    <>
      <Cable x={DIVE_X} top={0} bottom={depth} />
      {scaled(DIVE_X, depth)}
    </>
  );
}

/**
 * A section slide's echo of the Hero motif of "What lies below the waterline of sustainable AI skills" (picked
 * Title-slide Option 0a): the zone's Scene, the robot sunk to the Section's depth, the Section's card leading with its
 * AI statement, and the whole depth ruler with the Section's tile lit. Shared because all eight section slides draw it.
 * Both view lines render; the page-level view switch shows one.
 */
export function WaterlineEcho({ section, zones, rulerLabel, robotAt, ...card }: WaterlineEchoProps) {
  const zone = WATERLINE_SECTIONS[section];
  if (zone === undefined) throw new Error(`No Section ${section} of ${WATERLINE_SECTIONS.length}.`);
  return (
    <div data-echo data-section={section} className="relative isolate">
      <ZoneScene
        zone={zone}
        ambient={false}
        className="flex min-h-96 flex-col gap-3 rounded-2xl p-5"
        overlay={<EchoOverlay zone={zone} section={section} zones={zones} rulerLabel={rulerLabel} card={card} />}
      >
        <Dive at={robotAt} surface={zone === 'surface'} />
      </ZoneScene>
    </div>
  );
}

/** The words over the echo's drawing: the zone's name, the Section's card and the whole ruler. */
function EchoOverlay({
  zone,
  section,
  zones,
  rulerLabel,
  card,
}: Pick<WaterlineEchoProps, 'section' | 'zones' | 'rulerLabel'> & {
  readonly zone: Zone;
  readonly card: EchoCardProps;
}) {
  return (
    <>
      <p data-echo-zone className="text-caption font-semibold tracking-wide uppercase">
        {zones[zone].name}
      </p>
      <div className="mt-auto flex flex-wrap items-end gap-3">
        <EchoCard {...card} />
        <div className="flex-1" />
        <DepthRuler
          sections={WATERLINE_SECTIONS}
          lit={section}
          zones={zones}
          label={rulerLabel}
          className="w-60 shrink-0"
        />
      </div>
    </>
  );
}

type EchoCardProps = Omit<WaterlineEchoProps, 'section' | 'zones' | 'rulerLabel' | 'robotAt'>;

/** The Section's card: its AI statement first, then its drawing, then the line of each view. */
function EchoCard({ tag, statement, chat, coding, tilt = 'left', wide, above, children }: EchoCardProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', wide ? 'w-72' : 'w-60')}>
      {above}
      <ZoneCard className={cn('rounded-lg p-3 shadow-md', tilt === 'left' ? '-rotate-1' : 'rotate-1')}>
        {tag === undefined ? null : <p className="text-caption font-semibold text-primary uppercase">{tag}</p>}
        <p data-ai-statement className="text-caption font-semibold">
          {statement}
        </p>
        {children}
        <InView view="chat" as="p" className="mt-1 text-caption text-muted-foreground">
          {chat}
        </InView>
        <InView view="coding" as="p" className="mt-1 font-mono text-caption text-muted-foreground">
          {coding}
        </InView>
      </ZoneCard>
    </div>
  );
}
