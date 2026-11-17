import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface PlaylistEntry {
  readonly key: string;
  readonly linked: boolean;
  readonly card: (className: string) => ReactNode;
}

function StepNumber({ step, first, muted }: { step: number; first: boolean; muted: boolean }) {
  return (
    <span
      aria-hidden
      data-step-number
      className={cn(
        'mt-4 flex size-10 shrink-0 items-center justify-center rounded-full text-body font-semibold tabular-nums',
        first ? 'bg-primary text-primary-foreground' : 'border border-border',
        !first && (muted ? 'text-muted-foreground' : 'text-foreground'),
      )}
    >
      {step}
    </span>
  );
}

function PlaylistStep({ entry, step }: { entry: PlaylistEntry; step: number }) {
  const first = step === 1;
  return (
    <li
      data-playlist-step
      {...(first ? { 'data-playlist-first': '' } : {})}
      className="flex items-start gap-4 sm:gap-6"
    >
      <StepNumber step={step} first={first} muted={!entry.linked} />
      {entry.card(cn('min-w-0 flex-1', first && 'shadow-md ring-2 ring-primary/25'))}
    </li>
  );
}

export function PlaylistList({ entries, title }: { entries: readonly PlaylistEntry[]; title: string }) {
  return (
    <section aria-labelledby="event-playlist" className="mt-14">
      <h2 id="event-playlist" className="text-subheading font-semibold text-foreground">
        {title}
      </h2>
      <ol data-event-playlist role="list" className="mt-6 space-y-4">
        {entries.map((entry, index) => (
          <PlaylistStep key={entry.key} entry={entry} step={index + 1} />
        ))}
      </ol>
    </section>
  );
}
