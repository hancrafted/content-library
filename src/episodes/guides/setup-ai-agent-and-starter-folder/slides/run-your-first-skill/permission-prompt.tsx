import type { ReactNode } from 'react';

export function WindowDots() {
  return (
    <span className="flex shrink-0 gap-2" aria-hidden>
      <span className="size-2 rounded-full bg-border" />
      <span className="size-2 rounded-full bg-border" />
      <span className="size-2 rounded-full bg-border" />
    </span>
  );
}

interface PermissionPromptProps {
  readonly title: string;
  readonly typed: string;
  /** What comes back before the prompt, muted. */
  readonly lookup: string;
  readonly children: ReactNode;
}

/**
 * The AI agent's terminal window at the moment it asks: the typed skill, the lookup it ran, then the approval box.
 * The `ai` glow marks the AI agent's window only (Visual language "Accent").
 */
export function PermissionPrompt({ title, typed, lookup, children }: PermissionPromptProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card ring-4 ring-ai/15">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2">
        <WindowDots />
        <span data-prompt-window className="ml-2 truncate text-caption text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 font-mono text-caption @3xl:p-5">
        <p className="text-primary">{typed}</p>
        <p className="text-muted-foreground">{lookup}</p>
        {children}
      </div>
    </div>
  );
}

interface ApprovalProps {
  /** The approval's heading, such as Claude Code's "Bash command"; absent where the wording is not verified. */
  readonly heading?: string;
  readonly corner: ReactNode;
  readonly command: ReactNode;
  readonly reason: string;
  readonly children: ReactNode;
}

export function Approval({ heading, corner, command, reason, children }: ApprovalProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <p className="flex items-center justify-between gap-2 font-semibold text-foreground">
        <span>{heading}</span>
        {corner}
      </p>
      <p className="pl-3 break-all text-foreground">{command}</p>
      <p className="pl-3 text-muted-foreground">{reason}</p>
      {children}
    </div>
  );
}

interface ChoicesProps {
  readonly question: string;
  readonly marker: ReactNode;
  readonly choices: readonly string[];
}

export function Choices({ question, marker, choices }: ChoicesProps) {
  return (
    <>
      <p className="mt-2 inline-flex items-center gap-2 text-foreground">
        <span data-question>{question}</span>
        {marker}
      </p>
      <ol className="flex flex-col gap-1">
        {choices.map((choice, index) => (
          <li
            key={choice}
            className={
              index === 0
                ? 'rounded-md bg-primary px-3 py-1 font-semibold text-primary-foreground'
                : 'px-3 text-muted-foreground'
            }
          >
            <span aria-hidden>{index === 0 ? '❯ ' : '  '}</span>
            {`${index + 1}. ${choice}`}
          </li>
        ))}
      </ol>
    </>
  );
}
