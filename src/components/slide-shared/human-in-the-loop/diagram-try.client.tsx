'use client';

import { cn } from '@/lib/utils';
import type { JobCardView } from './workflow-view.pure';

/** The open job and the way to open one: what the parent passes the diagram in Try mode. */
export interface JobOpener {
  readonly openJobId: string | null;
  readonly onOpenJob: (jobId: string) => void;
}

/** Try mode: under a job, its step number and first sentence, as the button that opens the job's modal. */
export function TryStep({ card, opener }: { card: JobCardView; opener: JobOpener }) {
  const pressed = opener.openJobId === card.id;
  return (
    <li>
      <button
        type="button"
        aria-pressed={pressed}
        aria-label={`${card.step ?? ''} ${card.title}`.trim()}
        onClick={() => opener.onOpenJob(card.id)}
        className={cn(
          'flex min-h-11 w-full cursor-pointer items-start gap-2 rounded-xl p-2 text-left text-caption outline-none',
          'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          pressed && 'bg-accent text-foreground',
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {card.step}
        </span>
        <span>{card.guide}</span>
      </button>
    </li>
  );
}
