import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The Iceberg style's five zones, from the top (docs/design/design-guide.md#iceberg). */
export type Zone = 'surface' | 'sunlit' | 'twilight' | 'midnight' | 'abyss';

/** Where the robot sits in a section slide's scene: on deck, just over the water, on its cable, or on the seabed. */
export type RobotAt = 'deck' | 'surface' | 'hanging' | 'seabed';

export interface WaterlineEchoProps {
  readonly zone: Zone;
  /** The zone's plain name, shown over the card. */
  readonly zoneLabel: string;
  readonly robotAt: RobotAt;
  /** The Section's place among the eight, from 0, which lights its tile on the depth ruler. */
  readonly section: number;
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

const SECTIONS = 8;

/**
 * A section slide's echo of the Hero motif of "What lies below the waterline of sustainable AI skills" (picked
 * Title-slide Option 0a): the zone's scene, the robot sunk to the Section's depth, the Section's card leading with its
 * AI statement, and the depth ruler with the Section's tile lit. Shared because all eight section slides draw it.
 *
 * The scenery, the robot and the depth ruler are slots: design-ADR-0025 gives them to later Build jobs, so this part
 * draws no figure itself. Both view lines render; the coding-agent line stays hidden until the page-level view toggle
 * shows it.
 */
export function WaterlineEcho({ zone, zoneLabel, robotAt, section, ...card }: WaterlineEchoProps) {
  return (
    <div
      data-echo
      data-zone={zone}
      className="relative isolate flex min-h-96 flex-col gap-3 overflow-hidden rounded-2xl p-5"
    >
      {/* filled by implement-iceberg-style: <ZoneScene zone={zone} /> draws this zone's sky or sea, rays and seabed. */}
      <div data-slot="zone-scene" data-zone={zone} aria-hidden="true" className="absolute inset-0 -z-10 bg-muted" />
      <p data-zone-label className="text-caption font-semibold tracking-wide text-foreground uppercase">
        {zoneLabel}
      </p>
      <div className="mt-auto flex items-end gap-3">
        <EchoCard {...card} />
        <div className="flex-1" />
        {/* filled by implement-scene-cast: <Robot /> at this depth, on its cable from the ship (and <Ship rock /> on the Surface). */}
        <div data-slot="robot" data-robot-at={robotAt} aria-hidden="true" className="size-16 shrink-0" />
        <RulerSlot section={section} />
      </div>
    </div>
  );
}

type EchoCardProps = Omit<WaterlineEchoProps, 'zone' | 'zoneLabel' | 'robotAt' | 'section'>;

/** The Section's card: its AI statement first, then its drawing, then the line of each view. */
function EchoCard({ tag, statement, chat, coding, tilt = 'left', wide, above, children }: EchoCardProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', wide ? 'w-72' : 'w-60')}>
      {above}
      <div
        className={cn(
          'rounded-lg bg-card p-3 text-card-foreground shadow-md',
          tilt === 'left' ? '-rotate-1' : 'rotate-1',
        )}
      >
        {tag === undefined ? null : <p className="text-caption font-semibold text-primary uppercase">{tag}</p>}
        <p data-ai-statement className="text-caption font-semibold">
          {statement}
        </p>
        {children}
        <p data-view="chat" className="mt-1 text-caption text-muted-foreground">
          {chat}
        </p>
        <p data-view="coding" className="mt-1 hidden font-mono text-caption text-muted-foreground">
          {coding}
        </p>
      </div>
    </div>
  );
}

/** filled by implement-iceberg-style: the shared depth ruler, one tile per Section, this Section's lit. */
function RulerSlot({ section }: { section: number }) {
  return (
    <ol data-slot="depth-ruler" aria-hidden="true" className="flex shrink-0 flex-col items-end gap-1">
      {Array.from({ length: SECTIONS }, (_, index) => (
        <li
          key={index}
          data-lit={index === section ? '' : undefined}
          className={cn('rounded-sm bg-foreground', index === section ? 'h-3 w-8' : 'h-2 w-5 opacity-25')}
        />
      ))}
    </ol>
  );
}
