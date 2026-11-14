import { MarkIcon } from '@/episodes/components/slide-shared/party-board/sticky-note';
import type { ReactNode } from 'react';

export interface GoalCheckProps {
  /** The goal strip: what the result is checked against. */
  readonly goal: string;
  /** What the result misses, crossed. */
  readonly finding: string;
  /** Which card already held the fact, its name set off by the Scene. */
  readonly seenOn: ReactNode;
  readonly why: string;
  /** The fix's label, with the Context marker the Scene sets beside it. */
  readonly fixLabel: ReactNode;
  /** The line the fix writes back into the contract. */
  readonly fix: string;
  readonly marks: { readonly failed: string; readonly fixed: string };
}

/** The fix, below a dashed rule: the line written back into the contract, ticked in success. */
function FixRow({ fixLabel, fix, label }: Pick<GoalCheckProps, 'fixLabel' | 'fix'> & { label: string }) {
  return (
    <div className="mt-auto flex items-start justify-between gap-4 border-t border-dashed border-border px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 text-caption text-(--success) uppercase">{fixLabel}</span>
        <span data-fix className="text-body">
          {fix}
        </span>
      </div>
      <MarkIcon mark="fixed" label={label} className="size-6" />
    </div>
  );
}

/**
 * The validation card: the result checked against the goal, its goal strip the Scene's only `bg-primary` fill. The
 * finding is crossed in destructive, naming the card that already held the fact; the fix, below a dashed rule, ticks in
 * success, written back into the contract.
 */
export function GoalCheck({ goal, finding, seenOn, why, fixLabel, fix, marks }: GoalCheckProps) {
  return (
    <div
      data-goal-check
      className="flex flex-1 flex-col overflow-hidden rounded-lg border-2 border-primary bg-card shadow-md"
    >
      <p data-goal-strip className="bg-primary px-5 py-3 text-body font-semibold text-primary-foreground">
        {goal}
      </p>
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex flex-col gap-1">
          <span data-finding className="text-body font-semibold">
            {finding}
          </span>
          <span className="text-caption text-muted-foreground">{seenOn}</span>
          <span className="text-caption text-muted-foreground">{why}</span>
        </div>
        <MarkIcon mark="failed" label={marks.failed} className="size-6" />
      </div>
      <FixRow fixLabel={fixLabel} fix={fix} label={marks.fixed} />
    </div>
  );
}
