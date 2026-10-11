'use client';

import { useEpisodePortalRoot } from '@/hooks/use-episode-portal-root';
import { cn } from '@/lib/utils';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { placeTooltip, type TooltipPlacement } from './horizontal-gantt.pure';

export interface BarCopy {
  date: string;
  title: string;
  caption: string;
}

/** Keeps the placement in step with the bar while the page scrolls or resizes, and closes on Esc or a press elsewhere. */
function usePlacement(anchor: HTMLElement, onClose: () => void): TooltipPlacement | null {
  const [placement, setPlacement] = useState<TooltipPlacement | null>(null);
  useLayoutEffect(() => {
    const place = () =>
      setPlacement(
        placeTooltip(anchor.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight }),
      );
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    const onPress = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !anchor.contains(target)) onClose();
    };
    place();
    window.addEventListener('scroll', place, { capture: true, passive: true });
    window.addEventListener('resize', place);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPress);
    return () => {
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPress);
    };
  }, [anchor, onClose]);
  return placement;
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
 * the chrome. It opens above the bar and flips below when there is no room.
 */
export function GanttTooltip({ id, anchor, copy, lane, laneClass, onClose }: TooltipProps) {
  const root = useEpisodePortalRoot();
  const placement = usePlacement(anchor, onClose);
  if (root === null || placement === null) return null;
  const { side, top, bottom, left, width } = placement;
  return createPortal(
    <div
      id={id}
      role="tooltip"
      data-slot="gantt-tooltip"
      data-side={side}
      style={{ top, bottom, left, width }}
      className={cn(
        'pointer-events-auto fixed overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-lg',
        laneClass,
      )}
    >
      <div aria-hidden="true" className="h-1 bg-(--lane)" />
      <div className="p-4">
        <p className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold tabular-nums">{copy.date}</span>
          <span className="text-muted-foreground">{lane}</span>
        </p>
        <p className="mt-2 text-lg leading-snug font-semibold">{copy.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.caption}</p>
      </div>
    </div>,
    root,
  );
}
