'use client';

import { usePopoverPlacement } from '@/hooks/use-popover-placement';
import { popoverBox } from '@/lib/popover-placement.pure';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { TOGGLETIP_RULES, type RailSide } from './horizontal-rail.pure';

const SLOT = 'rail-toggletip';

export interface ToggletipCopy {
  date: string;
  title: string;
  caption: string;
}

/** Points from the toggletip's edge at the label's centre. */
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

/**
 * A dot's one spoken line, its depth: the time and the action already show
 * at rest. Portaled into the Episode portal root (FE-009 §8) so no Slide
 * wrapper's stacking context traps it under the chrome. It opens on its
 * label's side, flipping when that side has no room.
 */
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
      <p className="text-body leading-relaxed text-foreground">{copy.caption}</p>
    </div>,
    root,
  );
}
