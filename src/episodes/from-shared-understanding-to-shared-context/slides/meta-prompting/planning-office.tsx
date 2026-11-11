import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { AiSpark, PersonFigure } from './figures';

export interface PlanningOfficeProps {
  readonly label: string;
  /** The interview, turn by turn: the AI's questions in `ai`, your answers in `human`. */
  readonly exchange: readonly { readonly slug: string; readonly who: 'ai' | 'human'; readonly text: string }[];
  /** "You only answer": the person's line under the chat. */
  readonly you: ReactNode;
  /** The claim the first Speaker note backs, its Context marker beside it. */
  readonly answerBetter: ReactNode;
  readonly residue: string;
}

const BUBBLE = {
  ai: 'self-start rounded-bl-sm border border-ai/40 bg-ai/10',
  human: 'self-end rounded-br-sm bg-human/15',
} as const;

/** The drafts that stay behind: three loose sheets, dulled toward `muted-foreground`. */
function Drafts() {
  return (
    <svg viewBox="0 0 120 48" className="h-12 w-32 shrink-0" aria-hidden="true">
      <path d="M6 44 L10 10 L38 6 L42 40 Z" className="fill-muted stroke-muted-foreground/50" strokeWidth={1.5} />
      <path d="M34 46 L36 14 L66 12 L66 44 Z" className="fill-muted stroke-muted-foreground/50" strokeWidth={1.5} />
      <path d="M62 44 L70 16 L98 20 L92 46 Z" className="fill-muted stroke-muted-foreground/50" strokeWidth={1.5} />
      <path d="M44 22h14M44 28h12M74 26h14" className="stroke-muted-foreground/40" strokeWidth={1.5} />
    </svg>
  );
}

/**
 * The planning office, a separate chat behind a dashed wall: the AI asks, you answer, and the questions, half-ideas and
 * drafts stay here when the work order leaves.
 */
export function PlanningOffice({ label, exchange, you, answerBetter, residue }: PlanningOfficeProps) {
  return (
    <section
      data-room="office"
      className="flex flex-col gap-4 rounded-xl border-2 border-dashed border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-foreground px-3 py-1 text-caption font-medium text-background">{label}</span>
        <AiSpark className="size-10" />
      </div>
      <ol className="flex flex-col gap-3 text-caption">
        {exchange.map(({ slug, who, text }) => (
          <li key={slug} data-who={who} className={cn('max-w-xs rounded-2xl px-4 py-2', BUBBLE[who])}>
            {text}
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3 rounded-lg bg-human/10 px-3 py-2">
        <PersonFigure className="size-10" />
        <p className="text-caption">{you}</p>
      </div>
      {answerBetter}
      <div data-residue className="mt-auto flex items-end gap-3 border-t border-border pt-4">
        <Drafts />
        <p className="text-caption text-muted-foreground">{residue}</p>
      </div>
    </section>
  );
}
