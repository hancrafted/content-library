'use client';

import { useEpisodePortalRoot } from '@/hooks/use-episode-portal-root';
import { cn } from '@/lib/utils';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { placeToggletip, type RailSide, type ToggletipPlacement } from './horizontal-rail.pure';

export interface ToggletipCopy {
  date: string;
  title: string;
  caption: string;
}

/** Keeps the placement in step with the label while the page scrolls or resizes, and closes on Esc or a press elsewhere. */
function usePlacement(anchor: HTMLElement, side: RailSide, onClose: () => void): ToggletipPlacement | null {
  const [placement, setPlacement] = useState<ToggletipPlacement | null>(null);
  useLayoutEffect(() => {
    const place = () =>
      setPlacement(
        placeToggletip({
          anchor: anchor.getBoundingClientRect(),
          viewport: { width: window.innerWidth, height: window.innerHeight },
          side,
        }),
      );
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    const onPress = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!anchor.contains(target) && !target.closest('[data-slot="rail-toggletip"]')) onClose();
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
  }, [anchor, side, onClose]);
  return placement;
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
 * A dot's caption, portaled into the Episode portal root (FE-009 §8) so no
 * Slide wrapper's stacking context traps it under the chrome. It opens on
 * its label's side, flipping when that side has no room.
 */
interface ToggletipProps {
  id: string;
  anchor: HTMLElement;
  side: RailSide;
  copy: ToggletipCopy;
  onClose: () => void;
}

export function RailToggletip({ id, anchor, side, copy, onClose }: ToggletipProps) {
  const root = useEpisodePortalRoot();
  const placement = usePlacement(anchor, side, onClose);
  if (root === null || placement === null) return null;
  const { side: placed, top, bottom, left, width, arrowX } = placement;
  return createPortal(
    <div
      id={id}
      role="tooltip"
      data-slot="rail-toggletip"
      data-side={placed}
      style={{ top, bottom, left, width }}
      className="pointer-events-auto fixed rounded-lg border border-border bg-background p-4 text-foreground shadow-xl"
    >
      <ToggletipArrow side={placed} x={arrowX} />
      <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground tabular-nums">
        <span aria-hidden="true" className="h-px w-4 bg-brand-accent" />
        {copy.date}
      </p>
      <p className="mt-1 font-semibold">{copy.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.caption}</p>
    </div>,
    root,
  );
}
