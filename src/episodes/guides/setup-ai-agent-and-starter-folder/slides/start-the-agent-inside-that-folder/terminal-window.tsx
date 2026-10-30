import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import type { TerminalPrompt } from './start.pure';

/**
 * The Visual language's terminal window: softly rounded, a three-dot title bar, monospace lines. The window the AI
 * agent runs in carries the `ai` edge (Accent: the `ai` colour marks the AI agent itself, never decoration).
 */
export function TerminalWindow({ title, ai = false, children }: { title: string; ai?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border bg-background',
        ai ? 'border-ai/40 shadow-sm ring-4 ring-ai/10' : 'border-border',
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5" aria-hidden="true">
        <span className="size-3 rounded-full bg-border" />
        <span className="size-3 rounded-full bg-border" />
        <span className="size-3 rounded-full bg-border" />
        <span className="ml-3 truncate text-caption text-muted-foreground">{title}</span>
      </div>
      <div className="flex flex-col gap-3 p-5 font-mono text-body wrap-anywhere">{children}</div>
    </div>
  );
}

/** A prompt line: the folder name highlighted in `primary`, the check the viewer matches on their own screen. */
export function PromptLine({ prompt, highlight = false }: { prompt: TerminalPrompt; highlight?: boolean }) {
  return (
    <span className="text-muted-foreground">
      {prompt.before}
      <span
        className={cn(
          'inline-block whitespace-nowrap',
          highlight && 'rounded-md bg-primary/10 px-1.5 font-semibold text-primary ring-1 ring-primary',
        )}
      >
        {prompt.folder}
      </span>
      {prompt.after}
    </span>
  );
}
