import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The column labels above the tree, read from the goal at the right back to today at the left. */
export interface TreeColumns {
  readonly before: string;
  readonly justBefore: string;
  readonly start: string;
}

/** One subgoal and the notes that must be true before it. */
export interface Branch {
  readonly slug: string;
  /** The subgoal's note, drawn by the Scene. */
  readonly subgoal: ReactNode;
  /** The branch the Voice script follows: its bracket in `primary`. */
  readonly emphasis?: boolean;
  /** The notes under the subgoal, drawn by the Scene. */
  readonly leaves: readonly { readonly slug: string; readonly note: ReactNode }[];
}

export interface GoalTreeProps {
  readonly label: string;
  readonly columns: TreeColumns;
  /** The goal's note, at the right edge. */
  readonly goal: ReactNode;
  readonly branches: readonly [Branch, Branch];
}

/** Each branch's grid row on the wide board: the label row is the first. */
const ROW = ['@4xl:row-start-2', '@4xl:row-start-3'] as const;

/**
 * A bracket forking from its right end to two notes at its left, stretched to its box (`preserveAspectRatio="none"`,
 * the stroke kept by `non-scaling-stroke`). Drawn only on the wide board, where the tree reads right to left.
 */
function Bracket({ tall, emphasis }: { tall?: boolean; emphasis?: boolean }) {
  return (
    <svg
      viewBox={tall ? '0 0 40 200' : '0 0 40 100'}
      className="hidden w-10 shrink-0 @4xl:block"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={tall ? 'M38 100 H20 M20 50 V150 M20 50 H4 M20 150 H4' : 'M38 50 H20 M20 25 V75 M20 25 H4 M20 75 H4'}
        className={cn('fill-none', emphasis ? 'stroke-primary' : 'stroke-foreground')}
        strokeWidth={emphasis ? 3 : 2.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The goal: the board's only `bg-primary` fill, its kicker and the outcome it states. */
export function GoalNote({ kicker, text }: { kicker: string; text: string }) {
  return (
    <div
      data-goal-note
      className="flex flex-1 flex-col justify-center gap-2 rounded-md bg-primary p-6 text-primary-foreground shadow-md"
    >
      <span className="text-caption uppercase">{kicker}</span>
      <span data-note-text className="text-body font-semibold">
        {text}
      </span>
    </div>
  );
}

/** One subgoal's row: its notes, then the bracket to the subgoal; on a narrow board the subgoal sits above its notes. */
function BranchRow({ branch, row }: { branch: Branch; row: string }) {
  return (
    <div
      data-branch={branch.slug}
      className={cn(
        'flex flex-col-reverse gap-3 @4xl:col-span-9 @4xl:col-start-1 @4xl:grid @4xl:grid-cols-subgrid @4xl:gap-x-2',
        row,
      )}
    >
      <div className="flex flex-col gap-3 @2xl:flex-row @4xl:col-span-5">
        {branch.leaves.map((leaf) => (
          <div key={leaf.slug} data-leaf className="flex flex-1 flex-col">
            {leaf.note}
          </div>
        ))}
      </div>
      <div data-subgoal className="flex items-stretch gap-2 @4xl:col-span-4">
        <Bracket emphasis={branch.emphasis} />
        <div className="flex flex-1 flex-col justify-center">{branch.subgoal}</div>
      </div>
    </div>
  );
}

/**
 * The goal broken down: on a wide board, the goal at the right edge, forking into two subgoals, each forking into the
 * notes that must be true before it, on twelve columns (five for the notes, four for the subgoals, three for the
 * goal). On a narrow one, the same tree top down: the goal, then each subgoal above its notes.
 */
export function GoalTree({ label, columns, goal, branches }: GoalTreeProps) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-1 gap-4 @4xl:grid-cols-12 @4xl:gap-x-2 @4xl:gap-y-4">
      <div className="hidden grid-cols-subgrid items-center text-caption text-muted-foreground uppercase @4xl:col-span-12 @4xl:grid">
        <span className="col-span-5">{columns.before}</span>
        <span className="col-span-4">{columns.justBefore}</span>
        <span className="col-span-3 font-semibold text-primary">{columns.start}</span>
      </div>
      {branches.map((branch, index) => (
        <BranchRow key={branch.slug} branch={branch} row={ROW[index] ?? ''} />
      ))}
      <div className="order-first flex items-stretch gap-2 @4xl:order-none @4xl:col-span-3 @4xl:col-start-10 @4xl:row-span-2 @4xl:row-start-2">
        <Bracket tall emphasis />
        {goal}
      </div>
    </div>
  );
}
