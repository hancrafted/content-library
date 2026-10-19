import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface Stone {
  readonly slug: string;
  readonly title: string;
  readonly detail: string;
  /** A Context marker after the title. */
  readonly marker?: ReactNode;
  readonly target?: string;
}

/** Each stone's lift, so the four read as a path across, not a list. */
const LIFT = ['@min-[56rem]:mt-10', '@min-[56rem]:mt-4', '@min-[56rem]:mt-0', '@min-[56rem]:mt-6'];

/** The dashed arc over the stones, from one room to the other. */
function Arc() {
  return (
    <svg
      viewBox="0 0 600 60"
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 h-12 w-full"
      aria-hidden="true"
    >
      <g className="fill-none stroke-foreground/60" strokeWidth="2">
        <path d="M10 50 C 150 -10, 450 -10, 590 50" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
        <path d="M578 40 L592 52 L574 54" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function StoneCard({ stone, index, reveal }: { stone: Stone; index: number; reveal: number }) {
  return (
    <li
      data-reveal={reveal}
      data-target={stone.target}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex flex-col items-center gap-1 rounded-3xl border border-border bg-card px-2 py-5 text-center shadow-md',
        LIFT[index],
      )}
    >
      <span className="font-mono text-caption font-semibold text-human">{String(index + 1).padStart(2, '0')}</span>
      <span className="flex items-center gap-1 text-body font-semibold">
        {stone.title}
        {stone.marker}
      </span>
      <span className="text-caption text-muted-foreground">{stone.detail}</span>
    </li>
  );
}

/**
 * The gap between the rooms: its `primary` label, the one thing to look at, the line on who still sits in execution,
 * and the four stepping stones across a dashed gulf. The presenter reveals the gap, then the stones one by one, from
 * `reveal` on.
 */
export function Gap(props: {
  label: string;
  many: ReactNode;
  stones: readonly Stone[];
  reveal: { gap: number; firstStone: number };
  className?: string;
}) {
  return (
    <div data-reveal={props.reveal.gap} data-target="gap" className={cn('flex flex-col gap-5', props.className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="rounded-full bg-primary px-6 py-1.5 text-body font-semibold text-primary-foreground shadow-md">
          {props.label}
        </p>
        <p className="flex items-center gap-1 text-caption text-muted-foreground">{props.many}</p>
      </div>
      <div className="relative rounded-xl border-2 border-dashed border-foreground/30 bg-background px-4 pt-10 pb-6">
        <Arc />
        <ol
          data-target="stones"
          className="focus-group focus-group--dim-others relative grid grid-cols-2 gap-2 @min-[56rem]:grid-cols-4"
        >
          {props.stones.map((stone, index) => (
            <StoneCard key={stone.slug} stone={stone} index={index} reveal={props.reveal.firstStone + index} />
          ))}
        </ol>
      </div>
    </div>
  );
}
