import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export type MoveSlug = 'break' | 'requirements' | 'interview' | 'evaluate' | 'fresh';

export interface BriefMove {
  readonly slug: MoveSlug;
  readonly letter: string;
  readonly move: string;
  /** Today's step, its "Today:" label already in place. */
  readonly today: ReactNode;
  /** The one lit move, in `primary`. */
  readonly focus: boolean;
  /** A Context marker beside the letter, where a Speaker note points at the move. */
  readonly marker?: ReactNode;
  readonly target?: { readonly 'data-target': string };
}

export interface BriefRailProps {
  readonly callback: { readonly chip: string; readonly episode: string };
  readonly label: string;
  readonly moves: readonly BriefMove[];
}

/** This stop's share of the rail: down the left edge while the moves stack, across once they sit in a row. */
function Segment() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-foreground @3xl:inset-x-0 @3xl:inset-y-auto @3xl:top-1/2 @3xl:h-1 @3xl:w-auto @3xl:translate-x-0 @3xl:-translate-y-1/2"
    />
  );
}

function Dot({ focus }: { focus: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block rounded-full border-[3px]',
        focus ? 'size-9 border-primary bg-primary' : 'size-7 border-foreground bg-card',
      )}
    />
  );
}

function MoveCard({ move }: { move: BriefMove }) {
  return (
    <div
      {...move.target}
      className={cn(
        'card-hover card-hover--raise my-2 flex flex-col gap-2 rounded-xl bg-card p-4 @3xl:my-0',
        move.focus ? 'border-2 border-primary shadow-md' : 'shadow-sm',
      )}
    >
      <p
        className={cn(
          'inline-flex items-start justify-between text-heading leading-none font-semibold',
          move.focus && 'text-primary',
        )}
      >
        <span data-move-letter>{move.letter}</span>
        {move.marker}
      </p>
      <p data-move-name className="text-body font-semibold">
        {move.move}
      </p>
      <p className="border-t border-border pt-2 text-caption text-muted-foreground">{move.today}</p>
    </div>
  );
}

function Stop({ move }: { move: BriefMove }) {
  return (
    <li
      data-move={move.slug}
      data-focus={move.focus ? '' : undefined}
      className="focus-group__item grid grid-cols-[3rem_1fr] gap-x-4 @3xl:row-span-2 @3xl:grid-cols-1 @3xl:grid-rows-subgrid @3xl:gap-y-4"
    >
      <div className="relative flex items-center justify-center py-4 @3xl:h-12 @3xl:py-0">
        <Segment />
        <Dot focus={move.focus} />
      </div>
      <MoveCard move={move} />
    </li>
  );
}

/**
 * BRIEF on one rail: the five moves from the freelancer Episode as stops, each card with today's step under its letter,
 * the closing move lit. A copy of the `horizontal-rail` Master slide cut to five stops with every label below its dot,
 * without the rail's draw-in entrance or toggletips: the mapping is the claim and shows at rest. Hovering a card dims
 * the others.
 */
export function BriefRail({ callback, label, moves }: BriefRailProps) {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-muted p-5 @xl:p-8">
      <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
        <span className="rounded-full border border-ai/50 bg-card px-3 py-1">{callback.chip}</span>
        <span>{callback.episode}</span>
      </div>
      <ol
        aria-label={label}
        className="focus-group focus-group--dim-others grid grid-cols-1 @3xl:grid-cols-5 @3xl:grid-rows-[auto_1fr] @3xl:gap-x-4"
      >
        {moves.map((move) => (
          <Stop key={move.slug} move={move} />
        ))}
      </ol>
    </div>
  );
}
