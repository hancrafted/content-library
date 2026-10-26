import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * One Playlist entry as page assembly hands it in: the card it built, ready to render with the list's own classes,
 * and whether it opens a page, so an Episode with no page yet gets a muted step number.
 */
export interface PlaylistEntry {
  readonly key: string;
  readonly linked: boolean;
  /** Renders the card page assembly built, with the classes that place it beside its step number. */
  readonly card: (className: string) => ReactNode;
}

/** The step number beside a card: filled for the emphasised first step, muted for an Episode with no page yet. */
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

/** One Playlist entry: its step number and its card, the first one raised and ringed. */
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

/**
 * An Event's Playlist on its page: the entries in the Playlist's order, the first emphasised as where to start; the
 * step number is text beside each card, the list itself says the order. The cards arrive ready-made from page
 * assembly, so the Events area never builds an Episode card.
 */
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
