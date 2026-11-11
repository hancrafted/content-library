import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { Darts, type DartTone, type Point } from '@/episodes/components/slide-shared/dartboard/darts';
import { DocumentIcon } from '@/episodes/components/slide-shared/factory-line/icons';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The four outcomes, in the quadrant's reading order: precise row on top, the intent hit on the right. */
export type Outcome = 'precise-off' | 'precise-accurate' | 'neither' | 'accurate-scattered';

interface OutcomeLook {
  /** Where the four darts land on the 120 by 120 board. */
  readonly darts: readonly Point[];
  readonly tone: DartTone;
  /** A crisp sheet leaves nothing to ask; a vague one is dashed and dulled. */
  readonly crisp: boolean;
  /** Off the intent: the name and a crisp sheet are drawn in `warning`. */
  readonly miss: boolean;
}

export const OUTCOMES: Record<Outcome, OutcomeLook> = {
  'precise-off': {
    darts: [
      { x: 86, y: 32 },
      { x: 92, y: 36 },
      { x: 88, y: 39 },
      { x: 93, y: 30 },
    ],
    tone: 'warning',
    crisp: true,
    miss: true,
  },
  'precise-accurate': {
    darts: [
      { x: 57, y: 58 },
      { x: 63, y: 61 },
      { x: 59, y: 64 },
      { x: 62, y: 56 },
    ],
    tone: 'primary',
    crisp: true,
    miss: false,
  },
  neither: {
    darts: [
      { x: 22, y: 30 },
      { x: 96, y: 70 },
      { x: 80, y: 22 },
      { x: 34, y: 94 },
    ],
    tone: 'warning',
    crisp: false,
    miss: true,
  },
  'accurate-scattered': {
    darts: [
      { x: 40, y: 50 },
      { x: 78, y: 44 },
      { x: 55, y: 86 },
      { x: 74, y: 76 },
    ],
    tone: 'foreground',
    crisp: false,
    miss: false,
  },
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

/** The outcome's dartboard: the shared board with a dulled bull, four darts in the outcome's tone. */
function OutcomeBoard({ outcome }: { outcome: Outcome }) {
  const { darts, tone } = OUTCOMES[outcome];
  return (
    <svg viewBox="0 0 120 120" className="size-20 shrink-0 @3xl:size-28" aria-hidden="true">
      <Dartboard cx={60} cy={60} r={56} rings={3} bull={10} tone="hero" bullTone="muted" />
      <Darts points={darts} tone={tone} r={5} edge />
    </svg>
  );
}

/** The work order that arrives at the bench: a crisp sheet in full ink, a vague one dashed and dulled. */
function WorkOrder({ outcome, label, sheet }: { outcome: Outcome; label: string; sheet: string }) {
  const { crisp, miss } = OUTCOMES[outcome];
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
      <p
        className={cn('flex items-center gap-1 text-body font-semibold', OUTCOMES[outcome].miss && 'text-(--warning)')}
      >
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
      <OutcomeBoard outcome={outcome} />
      <OutcomeText outcome={outcome} words={words} marker={marker} />
    </li>
  );
}
