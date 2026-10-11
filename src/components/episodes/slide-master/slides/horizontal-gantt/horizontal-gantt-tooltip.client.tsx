'use client';

import { usePopoverPlacement } from '@/hooks/use-popover-placement';
import { popoverBox } from '@/lib/popover-placement.pure';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { TOOLTIP_RULES } from './horizontal-gantt.pure';

const SLOT = 'gantt-tooltip';

export interface BarCopy {
  date: string;
  title: string;
  caption: string;
}

interface TooltipProps {
  id: string;
  anchor: HTMLElement;
  copy: BarCopy;
  lane: string;
  /** The class that sets the lane's colour as the `--lane` custom property. */
  laneClass: string;
  onClose: () => void;
}

/**
 * A bar's date range and caption, portaled into the Episode portal root
 * (FE-009 §8) so the Slide wrapper's stacking context never traps it under
 * the chrome. It opens above the bar and flips below when there is no room;
 * a press inside it keeps it open, as for every Slide popover.
 */
export function GanttTooltip({ id, anchor, copy, lane, laneClass, onClose }: TooltipProps) {
  const placed = usePopoverPlacement({ anchor, side: 'above', rules: TOOLTIP_RULES, slot: SLOT, onClose });
  if (placed === null) return null;
  const { root, placement } = placed;
  return createPortal(
    <div
      id={id}
      role="tooltip"
      data-slot={SLOT}
      data-side={placement.side}
      style={popoverBox(placement)}
      className={cn(
        'pointer-events-auto fixed overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-lg',
        laneClass,
      )}
    >
      <div aria-hidden="true" className="h-1 bg-(--lane)" />
      <div className="p-4">
        <p className="flex items-baseline justify-between gap-3 text-body">
          <span className="font-semibold tabular-nums">{copy.date}</span>
          <span className="text-muted-foreground">{lane}</span>
        </p>
        <p className="mt-2 text-body leading-snug font-semibold">{copy.title}</p>
        <p className="mt-1 text-body leading-relaxed text-muted-foreground">{copy.caption}</p>
      </div>
    </div>,
    root,
  );
}
