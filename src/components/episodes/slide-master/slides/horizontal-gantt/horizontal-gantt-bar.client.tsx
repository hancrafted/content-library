'use client';

import { cn } from '@/lib/utils';
import type { FocusEvent, MouseEvent } from 'react';
import type { BarCopy } from './horizontal-gantt-tooltip.client';
import {
  barBox,
  elapsedShare,
  GANTT_BARS,
  growTiming,
  TODAY,
  type GanttItem,
  type GanttLane,
} from './horizontal-gantt.pure';

/** Each lane's colour, set as `--lane` so the bar, its swatch and its tooltip share it; the tokens carry dark values. */
export const LANE_CLASS: Record<GanttLane, string> = {
  a: '[--lane:var(--primary)]',
  b: '[--lane:var(--foreground)]',
  c: '[--lane:var(--muted-foreground)]',
};

/** The bar's still-planned part: a hatch in its lane colour, so progress reads by texture as well as tint. */
const HATCH =
  'bg-[repeating-linear-gradient(135deg,color-mix(in_oklch,var(--lane)_22%,transparent)_0_6px,color-mix(in_oklch,var(--lane)_8%,transparent)_6px_12px)]';

export interface BarHandlers {
  onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

interface BarProps {
  item: GanttItem;
  copy: BarCopy;
  grown: boolean;
  /** Set while this bar's tooltip is open. */
  expanded: boolean;
  dimmed: boolean;
  tipId: string;
  handlers: BarHandlers;
}

/** One phase: a pill from its start to its end, filled up to today and hatched beyond, growing from its start. */
export function GanttBar({ item, copy, grown, expanded, dimmed, tipId, handlers }: BarProps) {
  const bar = GANTT_BARS[item];
  const { leftPct, widthPct } = barBox(bar);
  return (
    <li style={{ left: `${leftPct}%`, width: `${widthPct}%` }} className="absolute inset-y-0 flex items-center px-0.5">
      <button
        type="button"
        aria-label={`${copy.title}, ${copy.date}`}
        aria-describedby={expanded ? tipId : undefined}
        {...handlers}
        className={cn(
          'group h-11 w-full rounded-full transition-opacity duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          dimmed && 'opacity-30',
          LANE_CLASS[bar.lane],
        )}
      >
        <BarFace item={item} title={copy.title} grown={grown} />
      </button>
    </li>
  );
}

/** The pill itself, clipped open from its left edge as the entrance sweep passes its start. */
function BarFace({ item, title, grown }: { item: GanttItem; title: string; grown: boolean }) {
  const bar = GANTT_BARS[item];
  const { delayMs, durationMs } = growTiming(bar);
  return (
    <span
      style={{ transitionDelay: `${delayMs}ms`, transitionDuration: `${durationMs}ms` }}
      className={cn(
        'relative flex h-full items-center overflow-hidden rounded-full border border-(--lane) transition-[clip-path] ease-out',
        HATCH,
        grown ? '[clip-path:inset(0_0_0_0_round_9999px)]' : '[clip-path:inset(0_100%_0_0_round_9999px)]',
        'motion-reduce:[clip-path:none]! print:[clip-path:none]!',
      )}
    >
      <span
        aria-hidden="true"
        style={{ width: `${elapsedShare(bar, TODAY) * 100}%` }}
        className="absolute inset-y-0 left-0 bg-[color-mix(in_oklch,var(--lane)_38%,transparent)]"
      />
      <span aria-hidden="true" className="relative ml-1.5 size-6 shrink-0 rounded-full bg-(--lane)" />
      <span className="relative truncate px-2.5 text-body font-semibold text-foreground group-hover:underline">
        {title}
      </span>
    </span>
  );
}
