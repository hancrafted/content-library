import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** A drawn terminal window (Visual language "The terminal window"): three-dot title bar, monospace lines. */
export interface TerminalWindowProps {
  readonly title: ReactNode;
  /** The AI agent runs in it: its edge and glow take the `ai` colour, the one place that colour appears. */
  readonly agent?: boolean;
  readonly children: ReactNode;
}

export function TerminalWindow({ title, agent = false, children }: TerminalWindowProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-background',
        agent ? 'border-ai/40 shadow-lg shadow-ai/20' : 'border-border shadow-md',
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-3 text-caption text-muted-foreground">{title}</span>
      </div>
      <div className="flex flex-col gap-3 p-5 font-mono text-caption">{children}</div>
    </div>
  );
}
