import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The five rows of the recipe, by their Translation keys, in Spec order. */
export type RowKey = 'node' | 'add' | 'setup' | 'check' | 'run';

interface CommandRowProps {
  readonly rowKey: RowKey;
  readonly n: number;
  readonly title: string;
  readonly reason: ReactNode;
  /** The row the recipe leads to: its number filled in `primary`. */
  readonly focal?: boolean;
  readonly children: ReactNode;
}

/** The row's left side: its number in a circle, its title and the one-line reason. */
function RowLead({ n, title, reason, focal }: Omit<CommandRowProps, 'rowKey' | 'children'>) {
  return (
    <div className="flex gap-4 @3xl:col-span-5">
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold',
          focal ? 'bg-primary text-primary-foreground' : 'border border-border',
        )}
      >
        {n}
      </span>
      <div className="min-w-0">
        <p data-row-title className="text-body font-semibold">
          {title}
        </p>
        <p className="mt-1 text-caption text-muted-foreground">{reason}</p>
      </div>
    </div>
  );
}

/**
 * One row of the recipe card: its number, title and reason on the left, what to do on the right (an exact line, a
 * link, a drawing). Each row is a `focus-group__item`, so pointing at one dims the others while Han presents. Stacks
 * below a wide container.
 */
export function CommandRow({ rowKey, focal = false, children, ...lead }: CommandRowProps) {
  return (
    <li
      data-row={rowKey}
      data-focal={focal || undefined}
      className="focus-group__item grid items-start gap-4 border-b border-border p-4 last:border-b-0 @3xl:grid-cols-12 @3xl:gap-8 @3xl:p-6"
    >
      <RowLead {...lead} focal={focal} />
      <div className="flex min-w-0 flex-col gap-3 @3xl:col-span-7">{children}</div>
    </li>
  );
}
