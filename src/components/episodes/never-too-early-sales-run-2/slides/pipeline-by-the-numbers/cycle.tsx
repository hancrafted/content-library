import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

interface CycleProps {
  /** Lead, Opportunity and Deal, in that order; the grid's tracks are proportional to their durations. */
  durations: readonly { slug: string; label: string }[];
  total: string;
  segmentClassName?: string;
  totalClassName?: string;
}

/**
 * The sales cycle as a bar proportional to time: 2 weeks is a sliver (kept readable by a minimum), 6 months
 * dominates, 3 months follows, and the 9.5-month total sits at the right end as the Slide's one primary mark. The
 * segments carry `--i` 5 to 7 and the total 8, after the funnel. A server part with plain props.
 */
export function Cycle({ durations, total, segmentClassName, totalClassName }: CycleProps) {
  return (
    <div
      data-cycle=""
      className="mt-8 grid grid-cols-[minmax(4.5rem,0.5fr)_6fr_3fr] gap-x-1 gap-y-2 sm:grid-cols-[minmax(4.5rem,0.5fr)_6fr_3fr_auto] sm:items-start"
    >
      {durations.map((duration, index) => (
        <div key={duration.slug} data-cycle-segment={duration.slug} className="flex min-w-0 flex-col gap-2">
          <span
            className={cn('h-1.5 rounded-full bg-foreground', segmentClassName)}
            style={{ '--i': 5 + index } as CSSProperties}
          />
          <span className="text-caption text-muted-foreground">{duration.label}</span>
        </div>
      ))}
      <div
        data-cycle-total=""
        className={cn(
          'col-span-3 flex items-center gap-2 justify-self-end sm:col-span-1 sm:-mt-2.5 sm:ml-2',
          totalClassName,
        )}
        style={{ '--i': 8 } as CSSProperties}
      >
        <span aria-hidden="true" className="h-4 w-1.5 rounded-full bg-primary" />
        <span className="text-body font-semibold whitespace-nowrap text-primary">{total}</span>
      </div>
    </div>
  );
}
