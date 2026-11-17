'use client';

import { usePopoverPlacement } from '@/shared/hooks/use-popover-placement';
import { popoverBox } from '@/shared/lib/popover-placement.pure';
import { cn } from '@/shared/lib/utils';
import { createPortal } from 'react-dom';
import { TOGGLETIP_RULES, type RailSide } from './horizontal-rail.pure';

const SLOT = 'rail-toggletip';

export interface ToggletipCopy {
  date: string;
  title: string;
  caption: string;
}

function ToggletipArrow({ side, x }: { side: RailSide; x: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ left: x }}
      className={cn(
        'absolute size-3 -translate-x-1/2 rotate-45 border-border bg-background',
        side === 'above' ? '-bottom-1.5 border-r border-b' : '-top-1.5 border-t border-l',
      )}
    />
  );
}

// decision: FE-009 §8
interface ToggletipProps {
  id: string;
  anchor: HTMLElement;
  side: RailSide;
  copy: ToggletipCopy;
  onClose: () => void;
}

export function RailToggletip({ id, anchor, side, copy, onClose }: ToggletipProps) {
  const placed = usePopoverPlacement({ anchor, side, rules: TOGGLETIP_RULES, slot: SLOT, onClose });
  if (placed === null) return null;
  const { root, placement } = placed;
  return createPortal(
    <div
      id={id}
      role="tooltip"
      data-slot={SLOT}
      data-side={placement.side}
      style={popoverBox(placement)}
      className="pointer-events-auto fixed rounded-lg border border-border bg-background p-4 text-foreground shadow-xl"
    >
      <ToggletipArrow side={placement.side} x={placement.arrowX} />
      <p className="flex items-center gap-2 font-mono text-body tracking-widest text-muted-foreground tabular-nums">
        <span aria-hidden="true" className="h-px w-4 bg-brand-accent" />
        {copy.date}
      </p>
      <p className="mt-1 font-semibold">{copy.title}</p>
      <p className="mt-2 text-body leading-relaxed text-muted-foreground">{copy.caption}</p>
    </div>,
    root,
  );
}
