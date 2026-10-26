import { cn } from '@/lib/utils';
import { Undo2 } from 'lucide-react';
import { fanGeometry, type Connector as ConnectorKind } from './diagram-layout.pure';

/*
 * The hairlines both diagram views share: the arrow into a stage, the fans of a repeated stage's rounds, the dashed
 * arc under a gated stage and the quarter-turned arrow where the stages stack.
 */

export const STRAIGHT = (
  <svg viewBox="0 0 24 10" className="h-2.5 w-6" aria-hidden="true">
    <path d="M0 5h20" className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
    <path d="M18 1.5 23 5l-5 3.5z" className="fill-muted-foreground" />
  </svg>
);

function Fan({ direction, branches }: { direction: 'out' | 'in'; branches: number }) {
  const { height, lines, heads } = fanGeometry(direction, branches);
  return (
    <svg viewBox={`0 0 24 ${height}`} data-fan={direction} className="w-6" style={{ height }} aria-hidden="true">
      <path d={lines} className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
      <path d={heads} className="fill-muted-foreground" />
    </svg>
  );
}

/**
 * The hairline into a stage where the row runs across: straight, fanning out to its rounds, or fanning them back in.
 * It sits in the gap before the stage's body, centred on its cards (inside its padding), so every arrow meets the card
 * it points at.
 */
export function Connector({ kind, opens }: { kind: ConnectorKind; opens: boolean }) {
  const across = kind.kind === 'straight' ? STRAIGHT : <Fan direction={kind.kind} branches={kind.branches} />;
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-3 right-full hidden w-6 items-center justify-center @2xl:flex',
        opens ? 'bottom-14' : 'bottom-3',
      )}
    >
      {across}
    </div>
  );
}

/**
 * The dashed arc under a gated stage, from its right edge round to its left, ending in an arrowhead into the stage:
 * the human sends the work back. Where the stages stack it gives way to the badge's "↩ send back".
 */
export function SendBack({ word }: { word: string }) {
  return (
    <div data-send-back="" className="pointer-events-none relative mx-6 hidden h-8 @2xl:block">
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-3 w-full"
        aria-hidden="true"
      >
        <path
          d="M100 0 V10 Q100 20 94 20 H6 Q0 20 0 10 V4"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="4 3"
          className="fill-none stroke-muted-foreground"
          strokeWidth="1.5"
        />
      </svg>
      <span className="absolute inset-x-0 bottom-0 mx-auto flex w-fit items-center gap-1 text-caption text-muted-foreground">
        <Undo2 aria-hidden="true" className="size-3.5" />
        {word}
      </span>
    </div>
  );
}

/** Where the stages stack: a straight arrow turned a quarter, above the stage, since the cards then stack too. */
export function ArrowDown() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-6 flex h-6 w-6 items-center justify-center @2xl:hidden"
    >
      <div className="rotate-90">{STRAIGHT}</div>
    </div>
  );
}

/** The arrow into a job card from the one above it, laid in the gap between the two cards. */
export function JobArrow() {
  return (
    <div
      aria-hidden="true"
      data-job-arrow=""
      className="pointer-events-none absolute inset-x-0 bottom-full flex h-4 items-center justify-center"
    >
      <div className="rotate-90">{STRAIGHT}</div>
    </div>
  );
}
