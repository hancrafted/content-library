import { Frame } from '@/components/slide-shared/exhibition/frame';
import { WallLabel } from '@/components/slide-shared/exhibition/wall-label';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { ExhibitIcon, type ExhibitSlug } from './exhibit-icon';

/** One layer of an exhibit: its label line (with an optional Context marker), its claim and any further lines. */
interface Layer {
  readonly label: string;
  readonly text: string;
  readonly marker?: ReactNode;
  readonly extra?: ReactNode;
  /** The disclosure step it shows from; absent, it shows at rest. */
  readonly reveal?: number;
  readonly target?: string;
}

export interface ExhibitProps {
  readonly slug: ExhibitSlug;
  readonly title: string;
  readonly era: string;
  readonly line: string;
  readonly size: 'standard' | 'lead';
  /** The upper layer: what the machine took over. */
  readonly machine: Layer;
  /** The lower layer: where people moved up. */
  readonly people: Layer;
  readonly target?: string;
  /** What hangs under the label, e.g. a fork. */
  readonly children?: ReactNode;
}

const LABEL = 'flex items-center justify-between gap-2 text-caption font-semibold tracking-widest uppercase';

function MachineLayer({ slug, lead, layer }: { slug: ExhibitSlug; lead: boolean; layer: Layer }) {
  return (
    <div
      data-reveal={layer.reveal}
      data-target={layer.target}
      className={cn(
        'flex flex-col',
        lead
          ? 'gap-3 bg-ai/[calc(15%*var(--reveal-dim,1))] p-5'
          : 'gap-2 bg-machine/[calc(10%*var(--reveal-dim,1))] p-3',
      )}
    >
      <ExhibitIcon slug={slug} />
      <p className={cn(LABEL, 'text-foreground')}>
        {layer.label}
        {layer.marker}
      </p>
      <p className="text-body font-semibold">{layer.text}</p>
      {layer.extra}
    </div>
  );
}

function PeopleLayer({ lead, layer }: { lead: boolean; layer: Layer }) {
  return (
    <div
      data-reveal={layer.reveal}
      data-target={layer.target}
      className={cn(
        'flex flex-col gap-1 border-t border-dashed border-human/[calc(50%*var(--reveal-dim,1))] bg-human/[calc(10%*var(--reveal-dim,1))]',
        lead ? 'p-5' : 'p-3',
      )}
    >
      <p className={cn(LABEL, 'text-human')}>
        {layer.label}
        {layer.marker}
      </p>
      <p className="text-body font-semibold">{layer.text}</p>
      {layer.extra}
    </div>
  );
}

/**
 * One exhibit on the wall: a framed card, the machine's work on top and where people moved up below, its wall label
 * centred under it and whatever hangs beneath. A standard exhibit spans four shared rows of the wall (machine layer,
 * people layer, label, under-label) from the width its three columns fit, so the three frames are one height and their
 * seams line up; the lead exhibit, AI, stands apart and is taller by design.
 */
export function Exhibit({ slug, title, era, line, size, machine, people, target, children }: ExhibitProps) {
  const lead = size === 'lead';
  const subgrid = '@min-[40rem]:grid @min-[40rem]:grid-rows-subgrid';
  return (
    <div
      {...(target && { 'data-target': target })}
      className={cn('flex flex-col', !lead && `@min-[40rem]:row-span-4 ${subgrid}`)}
    >
      <Frame lead={lead} className={cn('flex flex-col', !lead && `@min-[40rem]:row-span-2 ${subgrid}`)}>
        <MachineLayer slug={slug} lead={lead} layer={machine} />
        <PeopleLayer lead={lead} layer={people} />
      </Frame>
      <WallLabel title={title} era={era} line={line} className="mt-4" />
      {children === undefined ? null : <div className="mt-6 flex flex-col gap-2">{children}</div>}
    </div>
  );
}
