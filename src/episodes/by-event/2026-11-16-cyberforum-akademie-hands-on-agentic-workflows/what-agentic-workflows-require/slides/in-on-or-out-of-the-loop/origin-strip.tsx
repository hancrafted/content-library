import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';

export interface Origin {
  readonly text: string;
  readonly marker: ReactNode;
}

export function OriginStrip({
  label,
  origins,
  targetProps,
}: {
  label: string;
  origins: readonly Origin[];
  targetProps?: TargetProps;
}) {
  return (
    <div
      {...targetProps}
      className="flex flex-wrap items-center gap-3 border-t border-border pt-4 text-caption text-muted-foreground"
    >
      <span className="font-semibold text-foreground uppercase">{label}</span>
      {origins.map((origin) => (
        <span key={origin.text} className="flex items-center gap-1">
          <span data-origin-pill className="rounded-full bg-foreground px-3 py-1 text-background">
            {origin.text}
          </span>
          {origin.marker}
        </span>
      ))}
    </div>
  );
}
