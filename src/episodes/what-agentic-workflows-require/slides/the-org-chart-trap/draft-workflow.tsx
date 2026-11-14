import { GoalNote } from '@/episodes/components/slide-shared/party-notes/goal-note';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** One column of the draft: a discipline's label and the steps it drew for itself. */
export interface DraftColumn {
  readonly slug: string;
  readonly label: string;
  readonly steps: readonly string[];
  /** The column the Scene leads the eye to: the Slide's one primary fill, its steps two to a row. */
  readonly focus?: boolean;
}

/** Slide 1's card look for a step: a card, a shadow and a slight tilt, alternating so the notes read handwritten. */
const tiltOf = (at: number) => (at % 4 === 0 || at % 4 === 3 ? '-rotate-1' : 'rotate-1');

function Column({ column }: { column: DraftColumn }) {
  const focus = column.focus === true;
  return (
    <div data-column={column.slug} className={cn('flex min-w-0 flex-col gap-2', focus && '@xl:col-span-2')}>
      <span
        data-column-label
        className={cn(
          'w-fit rounded-full px-3 py-1 text-caption',
          focus ? 'bg-primary font-semibold text-primary-foreground' : 'border border-foreground',
        )}
      >
        {column.label}
      </span>
      <ol className={cn('grid gap-2 text-caption', focus && 'focus-group focus-group--dim-others grid-cols-2')}>
        {column.steps.map((step, at) => (
          <li
            key={step}
            data-step
            className={cn('rounded-md bg-card px-2 py-1 shadow-md', tiltOf(at), focus && 'focus-group__item')}
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The committee's draft AI workflow, one column per discipline sized by its headcount, and the goal at the right edge
 * with no step leading back from it.
 */
export function DraftWorkflow(props: {
  label: ReactNode;
  columns: readonly DraftColumn[];
  goalLabel: string;
  goal: string;
  goalNote: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 @container">
      <p className="flex items-center gap-2 text-caption font-semibold text-muted-foreground uppercase">
        {props.label}
      </p>
      <div className="grid grid-cols-1 items-start gap-3 @xl:grid-cols-5">
        {props.columns.map((column) => (
          <Column key={column.slug} column={column} />
        ))}
        <div className="flex flex-col gap-2">
          <GoalNote
            label={props.goalLabel}
            text={props.goal}
            className="border-dashed border-primary [&>p:last-child]:text-caption"
          />
          <p data-goal-hint className="text-caption text-muted-foreground">
            {props.goalNote}
          </p>
        </div>
      </div>
    </div>
  );
}
