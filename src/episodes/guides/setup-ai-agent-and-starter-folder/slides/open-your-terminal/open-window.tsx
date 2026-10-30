import type { ReactNode } from 'react';

export interface OpenWindowProps {
  readonly title: string;
  /** What the terminal prints before it waits; none when it prints nothing. */
  readonly lines: readonly string[];
  readonly prompt: string;
  /** The Context marker in the window's corner. */
  readonly marker?: ReactNode;
  readonly target?: { readonly 'data-target'?: string };
}

/**
 * The Visual language's terminal window as it looks once open and waiting: a three-dot title bar, what it printed in
 * muted text, then the prompt and a still cursor in `primary` (nothing loops at rest).
 */
export function OpenWindow({ title, lines, prompt, marker, target }: OpenWindowProps) {
  return (
    <div
      data-open-window
      {...target}
      className="relative overflow-hidden rounded-xl border border-border bg-card shadow-md"
    >
      {marker}
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5 pr-12">
        <span className="size-3 shrink-0 rounded-full bg-border" />
        <span className="size-3 shrink-0 rounded-full bg-border" />
        <span className="size-3 shrink-0 rounded-full bg-border" />
        <span className="ml-3 truncate text-caption text-muted-foreground">{title}</span>
      </div>
      <div className="flex flex-col gap-1 px-5 pt-4 pb-16 font-mono text-caption">
        {lines.map((line) => (
          <p key={line} className="text-muted-foreground">
            {line}
          </p>
        ))}
        <p className="flex items-center gap-2">
          <span data-prompt-line className="text-muted-foreground">
            {prompt}
          </span>
          <span className="inline-block h-4 w-2 bg-primary" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
