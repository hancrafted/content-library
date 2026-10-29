import type { ReactNode } from 'react';

/* Step 6's own small parts: the icons, a move's text column and the AI agent's trust question. */

export function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="fill-none stroke-current" strokeWidth="2" />
      <path d="M12 11v6M12 7.5v.5" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** One move's left column: its number, title and lines, under the number's indent. */
export function MoveText({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:col-span-4 md:pt-2">
      <h4 className="flex items-center gap-3 text-body font-semibold text-foreground">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-caption text-background"
        >
          {n}
        </span>
        {title}
      </h4>
      <div className="flex flex-col gap-3 pl-11 text-caption text-muted-foreground">{children}</div>
    </div>
  );
}

/** The trust question as the AI agent asks it; the wording is Claude Code's, illustrative (the Spec's build notes). */
export function TrustBox({ question, path, yes, no }: { question: string; path: ReactNode; yes: string; no: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ai/40 bg-linear-to-br from-ai/10 to-transparent p-4 text-caption">
      <p className="font-semibold text-foreground">{question}</p>
      <p className="text-muted-foreground">{path}</p>
      <p className="mt-1 flex items-center gap-2 font-semibold text-primary">
        <span aria-hidden="true">›</span>
        {yes}
      </p>
      <p className="pl-4 text-muted-foreground">{no}</p>
    </div>
  );
}
