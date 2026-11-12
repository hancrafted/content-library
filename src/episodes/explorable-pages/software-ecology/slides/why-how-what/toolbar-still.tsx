import type { ReactNode } from 'react';

export interface ToolbarStillProps {
  /** The state row's states, in the Explorable's order. */
  readonly states: readonly string[];
  /** The Scenarios button, shown picked. */
  readonly scenarios: string;
  readonly tour: string;
  /** The picked scenario's "what to watch" line. */
  readonly watch: string;
  /** The pin that points at the row. */
  readonly pin: ReactNode;
}

const PILL = 'rounded-full border border-border bg-card px-2.5 py-0.5 text-caption text-foreground';

/** The Explorable's state row as a still: its states, the Scenarios button picked, Tour, and the watch line. */
export function ToolbarStill({ states, scenarios, tour, watch, pin }: ToolbarStillProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
      {pin}
      {states.map((state) => (
        <span key={state} className={PILL}>
          {state}
        </span>
      ))}
      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 text-caption font-semibold text-background">
        {scenarios} <span aria-hidden="true">▾</span>
      </span>
      <span className={`${PILL} inline-flex items-center gap-1`}>
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
          <path d="M2 1.5l6 3.5-6 3.5z" className="fill-none stroke-current" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        {tour}
      </span>
      <span className="ml-auto text-caption text-muted-foreground">{watch}</span>
    </div>
  );
}
