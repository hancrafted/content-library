import { Icon } from '@/episodes/components/slide-shared/route-chain/route-chain-icon';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export type PieceKind = 'terminal' | 'agent' | 'folder' | 'skill';
export type RouteState = 'done' | 'current' | 'upcoming';

/** One step inside a piece: its number, its words (a Context marker among them, maybe) and where the viewer is on it. */
export interface ChainStep {
  readonly n: number;
  readonly title: ReactNode;
  readonly state: RouteState;
  /** The step the "Jump to step 5" arc lands on: its number ringed in `primary`. */
  readonly landing?: boolean;
}

export interface ChainPieceProps {
  readonly kind: PieceKind;
  readonly label: string;
  readonly section: string;
  readonly state: RouteState;
  readonly steps: readonly ChainStep[];
  /** A closing line under the steps, an arrow before it: the skill piece's "hancrafted opens". */
  readonly result?: string;
}

/** A piece's card and icon tile: the current piece outlined in `primary`; the AI agent alone carries its `ai` glow. */
function lookOf(kind: PieceKind, state: RouteState): { card: string; tile: string } {
  if (kind === 'agent') return { card: 'border border-ai/40 shadow-lg shadow-ai/15', tile: 'bg-ai/15 text-ai' };
  return {
    card: state === 'current' ? 'border-2 border-primary' : 'border border-border',
    tile: 'bg-muted text-foreground',
  };
}

const DOT: Readonly<Record<RouteState, string>> = {
  done: 'bg-primary text-primary-foreground',
  current: 'border border-primary text-foreground',
  upcoming: 'border border-border',
};

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        className="fill-none stroke-current"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Step({ step }: { step: ChainStep }) {
  const dot = step.landing && step.state === 'upcoming' ? 'border border-primary text-foreground' : DOT[step.state];
  return (
    <li data-step={step.n} data-state={step.state} className="flex items-center gap-2">
      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full', dot)}>
        {step.state === 'done' ? <Check /> : step.n}
      </span>
      <span className={cn(step.state === 'current' && 'font-semibold text-foreground')}>{step.title}</span>
    </li>
  );
}

function Result({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
        <path
          d="M3 8h9M9 4.5L12.5 8 9 11.5"
          className="fill-none stroke-muted-foreground"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {text}
    </li>
  );
}

/**
 * One piece of the route (the Visual language's "One chain"): its icon, what it is and the Section that sets it up,
 * and the steps it holds. Words arrive as props; it owns none.
 */
export function ChainPiece({ kind, label, section, state, steps, result }: ChainPieceProps) {
  const look = lookOf(kind, state);
  return (
    <li
      data-piece={kind}
      data-state={state}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex min-w-0 flex-1 basis-0 flex-col gap-4 rounded-2xl bg-card p-5',
        look.card,
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', look.tile)}>
          <Icon of={kind} className="size-5" />
        </span>
        <span className="flex flex-col">
          <span className="text-body font-semibold">{label}</span>
          <span className="text-caption text-muted-foreground">{section}</span>
        </span>
      </div>
      <ul className="flex flex-col gap-2 border-t border-border pt-3 text-caption text-muted-foreground">
        {steps.map((step) => (
          <Step key={step.n} step={step} />
        ))}
        {result && <Result text={result} />}
      </ul>
    </li>
  );
}
