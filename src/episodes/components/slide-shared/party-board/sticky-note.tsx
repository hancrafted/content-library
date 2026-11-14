import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/*
 * The party board drawn as HTML, for a Scene that lays its notes out on a grid: the sticky note, the external note,
 * the doer badge and the marks. Each takes plain props and its words from the Scene. Shared because the page Slides of
 * one Episode pin the same notes to their boards (FE-007 §5); `note.tsx` draws the same note as SVG.
 */

/** A note's state: `fixed` a seam that now holds, `failed` one that breaks, `passed` a check that holds on a contract. */
export type Mark = 'fixed' | 'failed' | 'passed';

const STROKE: Record<Mark, string> = {
  fixed: 'stroke-(--success)',
  failed: 'stroke-destructive',
  passed: 'stroke-foreground',
};

/**
 * A mark as an icon, named for assistive technology: a tick for `fixed` (success) and `passed` (foreground, so success
 * and destructive stay with the board's fixed and failed notes), a cross for `failed` (destructive).
 */
export function MarkIcon({ mark, label, className }: { mark: Mark; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-5 shrink-0', className)} role="img" aria-label={label}>
      <path
        d={mark === 'failed' ? 'M4 4l8 8M12 4l-8 8' : 'M3 8.5l3 3 7-7'}
        className={cn('fill-none', STROKE[mark])}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Who does a task: an outline pill in the meaning colour `ai` for an agent, `human` for a person. */
export function DoerBadge({ doer, label }: { doer: 'ai' | 'human'; label: string }) {
  return (
    <span
      data-doer={doer}
      className={cn(
        'shrink-0 rounded-full border px-2 text-caption',
        doer === 'ai' ? 'border-ai text-ai' : 'border-human text-human',
      )}
    >
      {label}
    </span>
  );
}

export interface BoardNoteProps {
  readonly kicker: string;
  readonly text: string;
  readonly hint?: string;
  readonly tilt?: 'left' | 'right';
  /** The fixed mark: a success outline and a tick named by `markLabel`. */
  readonly mark?: 'fixed';
  readonly markLabel?: string;
  /** The note the Scene leads the eye along: a primary outline and kicker. */
  readonly emphasis?: boolean;
  /** Set at the kicker's end, such as a `DoerBadge`. */
  readonly badge?: ReactNode;
  readonly className?: string;
}

/** A note's look: its outline and its kicker's colour, from whether it is fixed or emphasised. */
function lookOf({ mark, emphasis }: Pick<BoardNoteProps, 'mark' | 'emphasis'>) {
  if (mark === 'fixed') return { outline: 'border-2 border-(--success)', kicker: 'text-(--success)' };
  if (emphasis === true) return { outline: 'border-2 border-primary', kicker: 'text-primary' };
  return { outline: undefined, kicker: 'text-muted-foreground' };
}

const TILT = { left: '-rotate-1', right: 'rotate-1' } as const;

/** A sticky note: a kicker, the fact in semibold and an optional hint, on a card tilted slightly. */
export function BoardNote({ kicker, text, hint, tilt, mark, markLabel, emphasis, badge, className }: BoardNoteProps) {
  const look = lookOf({ mark, emphasis });
  return (
    <div
      data-board-note
      data-mark={mark}
      className={cn(
        'flex flex-col gap-1 rounded-md bg-card p-4 shadow-md',
        tilt && TILT[tilt],
        look.outline,
        className,
      )}
    >
      <span
        data-note-kicker
        className={cn('flex items-center justify-between gap-2 text-caption uppercase', look.kicker)}
      >
        {kicker}
        {mark === 'fixed' && <MarkIcon mark="fixed" label={markLabel ?? ''} />}
        {badge}
      </span>
      <span data-note-text className="text-body font-semibold">
        {text}
      </span>
      {hint !== undefined && <span className="text-caption text-muted-foreground">{hint}</span>}
    </div>
  );
}

export interface ExternalNoteProps {
  readonly kicker: string;
  readonly text: string;
  readonly hint: string;
  /** Set beside the kicker, such as a Context marker. */
  readonly marker?: ReactNode;
  /** Set at the kicker's end, such as a `DoerBadge`. */
  readonly badge?: ReactNode;
  readonly className?: string;
}

/** A dependency outside your control: a dashed foreground outline, no card fill, so it reads as not yours to change. */
export function ExternalNote({ kicker, text, hint, marker, badge, className }: ExternalNoteProps) {
  return (
    <div
      data-board-note
      data-external
      className={cn('flex flex-col gap-1 rounded-md border-2 border-dashed border-foreground p-4', className)}
    >
      <span
        data-note-kicker
        className="flex items-center justify-between gap-2 text-caption text-muted-foreground uppercase"
      >
        <span className="inline-flex items-center gap-1">
          {kicker}
          {marker}
        </span>
        {badge}
      </span>
      <span data-note-text className="text-body font-semibold">
        {text}
      </span>
      <span className="text-caption text-muted-foreground">{hint}</span>
    </div>
  );
}
