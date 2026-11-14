import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { InView } from '../agent-view/in-view';
import { DepthRuler, type ZoneWords } from '../iceberg/depth-ruler';
import { zoneOf, type Zone } from '../iceberg/ruler.pure';
import { ZoneCard } from '../iceberg/zone-card';
import { WATERLINE_SECTIONS } from './depth';

export interface WaterlineEchoProps {
  /** The Section's place among the eight, from 0: its zone, its lit tile on the ruler. */
  readonly section: number;
  /** The five zones' words, for the ruler and the zone over the card. */
  readonly zones: ZoneWords;
  /** The ruler's name for assistive tech: `Depth ruler, What a skill is lit`. */
  readonly rulerLabel: string;
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

/**
 * A section slide's words over its echo of the Hero motif of "What lies below the waterline of sustainable AI skills"
 * (picked Title-slide Option 0a): the zone's name, the Section's card leading with its AI statement, and the whole
 * depth ruler with the Section's tile lit; on a phone the ruler gives way to the thin rail. The drawing itself, the
 * zone with the robot at the Section's depth, is the section slide's full-bleed rear decoration (`atDepth`), so these
 * words stay in the Foreground, inset clear of the table of contents. Shared because all eight section slides draw it.
 * Both view lines render; the page-level view switch shows one.
 */
export function WaterlineEcho({ section, zones, rulerLabel, ...card }: WaterlineEchoProps) {
  const zone = zoneOf(WATERLINE_SECTIONS, section);
  return (
    <div data-echo data-section={section} data-echo-depth={zone} className="flex min-h-[60svh] flex-col gap-3 py-5">
      <EchoOverlay zone={zone} section={section} zones={zones} rulerLabel={rulerLabel} card={card} />
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
          className="w-60 shrink-0 max-md:hidden"
        />
      </div>
    </>
  );
}

type EchoCardProps = Omit<WaterlineEchoProps, 'section' | 'zones' | 'rulerLabel'>;

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
