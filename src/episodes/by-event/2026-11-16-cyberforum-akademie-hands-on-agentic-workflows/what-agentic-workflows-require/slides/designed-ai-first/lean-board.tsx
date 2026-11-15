import { ContractCard, type ContractNoteProps } from '@/episodes/components/slide-shared/contract-card/contract-card';
import { DoerBadge } from '@/episodes/components/slide-shared/party-board/sticky-note';
import { GoalNote } from '@/episodes/components/slide-shared/party-notes/goal-note';
import { Pin } from '@/episodes/components/slide-shared/pin/pin';
import { cn } from '@/shared/lib/utils';
import { Fragment } from 'react';

/** One note of the lean board: the task, who does it, the contract under it and the pins of the tips it shows. */
export interface LeanNote {
  readonly slug: string;
  readonly text: string;
  readonly doer: 'ai' | 'human';
  readonly doerLabel: string;
  readonly contract: ContractNoteProps;
  /** The pin on the note itself. */
  readonly pin?: 1 | 2 | 3;
  /** The pin on the note's contract. */
  readonly contractPin?: 1 | 2 | 3;
}

/** The arrow from one note to the next, drawn only where the notes stand in one row. */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="mt-6 hidden size-6 shrink-0 @5xl:block" aria-hidden="true">
      <path
        d="M2 12 H20 M14 6 L20 12 L14 18"
        className="fill-none stroke-foreground"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TILT = ['-rotate-1', 'rotate-1'] as const;

function Note({ note, at }: { note: LeanNote; at: number }) {
  return (
    <div data-lean-note={note.slug} className="focus-group__item flex min-w-0 flex-1 flex-col gap-2">
      <div className={cn('relative flex flex-col items-start gap-1 rounded-md bg-card p-3 shadow-md', TILT[at % 2])}>
        <DoerBadge doer={note.doer} label={note.doerLabel} />
        <span data-note-text className="text-caption font-semibold">
          {note.text}
        </span>
        {note.pin !== undefined && <Pin n={note.pin} className="absolute -top-3 right-2" />}
      </div>
      <div className="relative">
        <ContractCard {...note.contract} />
        {note.contractPin !== undefined && <Pin n={note.contractPin} className="absolute -top-3 right-2" />}
      </div>
    </div>
  );
}

/** The goal at the right edge: the dashed primary note, its pin and the measurable outcome under it. */
function Goal({ label, text, outcome, pin }: { label: string; text: string; outcome: string; pin: 1 | 2 | 3 }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="relative">
        <GoalNote label={label} text={text} className="border-dashed border-primary [&>p:last-child]:text-caption" />
        <Pin n={pin} className="absolute -top-3 right-2" />
      </div>
      <p className="text-caption text-muted-foreground">{outcome}</p>
    </div>
  );
}

/**
 * The board redrawn from the goal: five notes chained left to right towards the goal at the right edge, a contract
 * card under each, and the tips' pins where they act. Below the widest container the notes wrap into a grid and the
 * arrows drop out.
 */
export function LeanBoard(props: {
  notes: readonly LeanNote[];
  goalLabel: string;
  goal: string;
  outcome: string;
  goalPin: 1 | 2 | 3;
}) {
  return (
    <div className="rounded-xl bg-muted p-5 @3xl:p-8">
      <div className="focus-group focus-group--dim-others grid grid-cols-1 gap-6 @2xl:grid-cols-2 @5xl:flex @5xl:items-start @5xl:gap-2">
        {props.notes.map((note, at) => (
          <Fragment key={note.slug}>
            <Note note={note} at={at} />
            <Arrow />
          </Fragment>
        ))}
        <Goal label={props.goalLabel} text={props.goal} outcome={props.outcome} pin={props.goalPin} />
      </div>
    </div>
  );
}
