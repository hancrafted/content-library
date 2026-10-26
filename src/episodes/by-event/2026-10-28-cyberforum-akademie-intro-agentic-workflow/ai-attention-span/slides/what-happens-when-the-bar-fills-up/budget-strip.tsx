import type { ReactNode } from 'react';

export interface BudgetStripProps {
  readonly firstKicker: string;
  /** The first message's budget sentence, its figure set off by the Slide. */
  readonly first: ReactNode;
  readonly planKicker: string;
  readonly plan: ReactNode;
  readonly mayFill: ReactNode;
  readonly forgotten: string;
  readonly reason: ReactNode;
  readonly caveat: ReactNode;
}

/** A budget figure: the number the reader compares across the arrow. */
export function BudgetFigure({ children }: { readonly children: ReactNode }) {
  return <b className="rounded bg-(--warning)/25 px-1 font-semibold whitespace-nowrap">{children}</b>;
}

/** The arrow from the faded budget to the plan: dashed, pointing down on a phone and right from `lg`. */
function Arrow() {
  return (
    <div className="flex items-center justify-center lg:col-span-1">
      <svg viewBox="0 0 60 30" className="w-12 rotate-90 lg:w-full lg:rotate-0" aria-hidden="true">
        <path
          d="M4 15 H 50"
          className="fill-none stroke-primary"
          strokeWidth="3"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
        <path
          d="M42 6 L 54 15 L 42 24"
          className="fill-none stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * The budget against the plan, under the cornerstone: the first message's budget in a dashed card (faded, the AI may
 * fill it), an arrow, the plan's total with the "forgotten" chip, and a tray naming why the budget got little
 * attention and what the studies measure.
 */
export function BudgetStrip(props: BudgetStripProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
      <div
        data-target="first"
        className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-muted-foreground bg-card p-5 lg:col-span-4"
      >
        <span className="text-caption tracking-wide text-muted-foreground uppercase">{props.firstKicker}</span>
        <p className="text-body">{props.first}</p>
        <span className="text-caption text-muted-foreground">{props.mayFill}</span>
      </div>
      <Arrow />
      <div
        data-target="plan"
        className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-md lg:col-span-4"
      >
        <span className="text-caption tracking-wide text-muted-foreground uppercase">{props.planKicker}</span>
        <p className="text-body">{props.plan}</p>
        <span className="self-start rounded-md bg-primary px-2 py-1 text-caption font-semibold text-primary-foreground">
          {props.forgotten}
        </span>
      </div>
      <div data-target="reason" className="flex flex-col justify-center gap-2 rounded-xl bg-muted p-5 lg:col-span-3">
        <p className="text-body">{props.reason}</p>
        <p className="text-caption text-muted-foreground">{props.caveat}</p>
      </div>
    </div>
  );
}
