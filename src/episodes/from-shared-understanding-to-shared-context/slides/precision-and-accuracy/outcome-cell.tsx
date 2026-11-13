import { OutcomeBoard, type PrecisionOutcome } from '@/episodes/components/slide-shared/dartboard/outcome-board';
import { DocumentIcon } from '@/episodes/components/slide-shared/factory-line/icons';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The four outcomes, the shared board's names; the Slide lays them out in the quadrant's reading order. */
export type Outcome = PrecisionOutcome;

/**
 * How each outcome's work order reads: a crisp sheet leaves nothing to ask, a vague one is dashed and dulled; off the
 * intent, the name and a crisp sheet are drawn in `warning`.
 */
const SHEETS: Record<Outcome, { readonly crisp: boolean; readonly miss: boolean }> = {
  'precise-off': { crisp: true, miss: true },
  'precise-accurate': { crisp: true, miss: false },
  neither: { crisp: false, miss: true },
  'accurate-scattered': { crisp: false, miss: false },
};

/** A right-pointing arrow before the bench line: the sheet arrives at the bike bench. */
function ArrivesArrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M2 8h10M8 4l4 4-4 4"
        className="fill-none stroke-current"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** What one cell says: its outcome's name, the work order's label and text, and what the bench makes of it. */
export interface OutcomeWords {
  readonly name: string;
  readonly workOrder: string;
  readonly sheet: string;
  readonly benchLabel: string;
  readonly bench: string;
}

/** The work order that arrives at the bench: a crisp sheet in full ink, a vague one dashed and dulled. */
function WorkOrder({ outcome, label, sheet }: { outcome: Outcome; label: string; sheet: string }) {
  const { crisp, miss } = SHEETS[outcome];
  return (
    <div
      data-work-order={crisp ? 'crisp' : 'vague'}
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-md"
    >
      <DocumentIcon tone={crisp ? (miss ? 'miss' : 'crisp') : 'vague'} className="h-8 w-7" />
      <div className="min-w-0">
        <p className="text-caption text-muted-foreground uppercase">{label}</p>
        <p className={cn('text-caption font-medium', crisp ? 'text-foreground' : 'text-muted-foreground')}>{sheet}</p>
      </div>
    </div>
  );
}

/** The cell's words: the outcome's name with its marker, the work order, and what the bench makes of it. */
function OutcomeText({ outcome, words, marker }: { outcome: Outcome; words: OutcomeWords; marker?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <p className={cn('flex items-center gap-1 text-body font-semibold', SHEETS[outcome].miss && 'text-(--warning)')}>
        {words.name}
        {marker}
      </p>
      <WorkOrder outcome={outcome} label={words.workOrder} sheet={words.sheet} />
      <p className="flex items-center gap-2 text-caption text-muted-foreground">
        <ArrivesArrow />
        <span>
          {words.benchLabel} {words.bench}
        </span>
      </p>
    </div>
  );
}

/**
 * One cell of the quadrant: the outcome's dartboard beside the work order that lands at the bike bench and what the
 * bench makes of it. The precise and accurate cell is outlined in `primary`, the one to look at.
 */
export function OutcomeCell(props: {
  outcome: Outcome;
  words: OutcomeWords;
  marker?: ReactNode;
  targetProps?: TargetProps;
}) {
  const { outcome, words, marker, targetProps } = props;
  return (
    <li
      data-outcome={outcome}
      {...targetProps}
      className={cn(
        'focus-group__item flex items-center gap-4 rounded-xl bg-card p-4 @3xl:gap-5 @3xl:p-5',
        outcome === 'precise-accurate' ? 'border-2 border-primary shadow-md' : 'border border-border',
      )}
    >
      <OutcomeBoard outcome={outcome} className="size-20 shrink-0 @3xl:size-28" />
      <OutcomeText outcome={outcome} words={words} marker={marker} />
    </li>
  );
}
