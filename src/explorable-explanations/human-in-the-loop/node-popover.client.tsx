'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import { usePopoverPlacement } from '@/shared/hooks/use-popover-placement';
import { popoverBox, type PopoverRules } from '@/shared/lib/popover-placement.pure';
import { useCallback, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const SLOT = 'venue-popover';

const RULES: PopoverRules = { maxWidth: 256, gap: 10, minRoom: 140 };

export interface NodeCopy {
  title: string;
  in: string;
  out: string;
  inLabel: string;
  outLabel: string;
}

interface NodePopoverProps {
  copy: NodeCopy;
  className?: string;
  children: ReactNode;
}

/**
 * A pipeline node, stage or job, as a button that opens its two-line popover: what goes in, what comes out. The
 * popover is portaled into the Episode portal root (FE-009 §8), as the metro map's is, so the chrome never covers it.
 */
export function NodePopover({ copy, className, children }: NodePopoverProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const motion = useMotion(anchor !== null);
  const close = useCallback(() => setAnchor(null), []);
  const toggle = (target: HTMLElement) => setAnchor((now) => (now ? null : target));
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? id : undefined}
        onClick={(event) => toggle(event.currentTarget)}
        className={className}
        {...motion}
      >
        {children}
      </button>
      {anchor && <Popover id={id} anchor={anchor} copy={copy} onClose={close} />}
    </>
  );
}

interface PopoverProps {
  id: string;
  anchor: HTMLElement;
  copy: NodeCopy;
  onClose: () => void;
}

function Popover({ id, anchor, copy, onClose }: PopoverProps) {
  const placed = usePopoverPlacement({ anchor, side: 'below', rules: RULES, slot: SLOT, onClose });
  if (placed === null) return null;
  const { root, placement } = placed;
  return createPortal(
    <div
      id={id}
      role="dialog"
      aria-label={copy.title}
      data-slot={SLOT}
      data-side={placement.side}
      style={popoverBox(placement)}
      className="pointer-events-auto fixed rounded-xl border border-border bg-background p-4 text-foreground shadow-lg"
    >
      <p className="text-caption font-semibold">{copy.title}</p>
      <p className="mt-1 text-caption text-muted-foreground">
        <b className="font-semibold text-foreground">{copy.inLabel}</b> {copy.in}
      </p>
      <p className="text-caption text-muted-foreground">
        <b className="font-semibold text-foreground">{copy.outLabel}</b> {copy.out}
      </p>
    </div>,
    root,
  );
}
