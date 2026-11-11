import type { ReactNode } from 'react';

export interface MoreIsNotSaferProps {
  readonly label: string;
  /** The label row's Context marker. */
  readonly marker: ReactNode;
  readonly alone: ReactNode;
  readonly together: ReactNode;
  readonly detail: string;
  readonly target: { 'data-target': string };
}

/** The stat card: one rule followed alone against nineteen at once, its detail revealed on hover. */
export function MoreIsNotSafer({ label, marker, alone, together, detail, target }: MoreIsNotSaferProps) {
  return (
    <div {...target} className="hover-reveal rotate-1 rounded-xl bg-card p-5 shadow-md">
      <p className="flex items-center justify-between text-caption text-muted-foreground uppercase">
        <span>{label}</span>
        {marker}
      </p>
      <p className="mt-2 text-body">{alone}</p>
      <p className="text-body">{together}</p>
      <p className="hover-reveal__detail mt-1 text-caption text-muted-foreground">{detail}</p>
    </div>
  );
}
