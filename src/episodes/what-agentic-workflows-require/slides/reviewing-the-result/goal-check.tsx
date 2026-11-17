import { MarkIcon } from '@/episodes/components/slide-shared/party-board/sticky-note';
import type { ReactNode } from 'react';

export interface GoalCheckProps {
  readonly goal: string;
  readonly finding: string;
  readonly seenOn: ReactNode;
  readonly why: string;
  readonly fixLabel: ReactNode;
  readonly fix: string;
  readonly marks: { readonly failed: string; readonly fixed: string };
}

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
