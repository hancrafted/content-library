import { fillTemplate } from '@/shared/lib/template.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { InView } from '../agent-view/in-view';
import { DepthGauge } from '../iceberg/depth-gauge';
import { ZoneCard } from '../iceberg/zone-card';
import type { ZoneWords } from '../iceberg/zone-words.pure';
import { zoneOf, type Zone } from '../iceberg/zones.pure';
import { WATERLINE_SECTIONS } from './depth';

export interface WaterlineEchoProps {
  readonly section: number;
  readonly place: string;
  readonly zones: ZoneWords;
  readonly gaugeLabel: string;
  readonly tag?: string;
  readonly statement: string;
  readonly chat: string;
  readonly coding: string;
  readonly tilt?: 'left' | 'right';
  readonly wide?: boolean;
  readonly above?: ReactNode;
  readonly children?: ReactNode;
}

/**
 * A section slide's words over its echo of the Hero motif of "What lies below the waterline of sustainable AI skills"
 * (picked Title-slide Option 0a): the Section's place in the Episode, the Section's card leading with its AI statement, and the slim
 * depth gauge at the right edge naming the Section's zone; on a phone the gauge gives way to the thin rail. The drawing itself, the
 * zone with the robot at the Section's depth, is the section slide's full-bleed rear decoration (`atDepth`), so these
 * words stay in the Foreground, inset clear of the table of contents. Shared because all eight section slides draw it.
 * Both view lines render; the page-level view switch shows one.
 */
export function WaterlineEcho({ section, place, zones, gaugeLabel, ...card }: WaterlineEchoProps) {
  const zone = zoneOf(WATERLINE_SECTIONS, section);
  const where = fillTemplate(place, { number: section + 1, total: WATERLINE_SECTIONS.length });
  return (
    <div
      data-echo
      data-section={section}
      data-echo-depth={zone}
      className="relative flex min-h-[60svh] flex-col gap-3 py-5"
    >
      <EchoOverlay zone={zone} where={where} zones={zones} gaugeLabel={gaugeLabel} card={card} />
    </div>
  );
}

function EchoOverlay({
  zone,
  where,
  zones,
  gaugeLabel,
  card,
}: Pick<WaterlineEchoProps, 'zones' | 'gaugeLabel'> & {
  readonly zone: Zone;
  readonly where: string;
  readonly card: EchoCardProps;
}) {
  return (
    <>
      <p data-echo-place className="text-caption font-semibold tracking-wide uppercase">
        {where}
      </p>
      <div className="mt-auto flex flex-wrap items-end gap-3">
        <EchoCard {...card} />
      </div>
      <DepthGauge
        zone={zone}
        words={zones[zone]}
        label={gaugeLabel}
        className="absolute top-[56%] right-0 max-md:hidden"
      />
    </>
  );
}

type EchoCardProps = Omit<WaterlineEchoProps, 'section' | 'place' | 'zones' | 'gaugeLabel'>;

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
