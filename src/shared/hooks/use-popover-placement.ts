import { useEpisodePortalRoot } from '@/shared/hooks/use-episode-portal-root';
import {
  placePopover,
  type PopoverPlacement,
  type PopoverRules,
  type PopoverSide,
} from '@/shared/lib/popover-placement.pure';
import { useLayoutEffect, useState } from 'react';

export interface PopoverPlacementInput {
  /** The element the popover points at. */
  anchor: HTMLElement;
  /** The side to open on when it has room there. */
  side: PopoverSide;
  /** The Slide's widths and gaps, from `@/shared/lib/popover-placement.pure`. */
  rules: PopoverRules;
  /** The popover's `data-slot`: a press inside it or on the anchor keeps it open. */
  slot: string;
  /** Called on Esc or a press elsewhere; keep it stable (`useCallback`). */
  onClose: () => void;
}

export interface PlacedPopover {
  /** The Episode portal root to `createPortal` into (FE-009 §8), so no Slide wrapper's stacking context traps the popover under the chrome. */
  root: HTMLElement;
  placement: PopoverPlacement;
}

/**
 * Re-places on every scroll (any scroller, so captured) and resize, and
 * closes on Esc or a press outside the anchor and the popover. Returns the
 * cleanup.
 */
function follow(
  { anchor, slot, onClose }: Pick<PopoverPlacementInput, 'anchor' | 'slot' | 'onClose'>,
  place: () => void,
): () => void {
  const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
  const onPress = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!anchor.contains(target) && !target.closest(`[data-slot="${slot}"]`)) onClose();
  };
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
}

/**
 * Places a Slide's popover beside its anchor and keeps it there while the
 * page scrolls or resizes; Esc or a press outside the anchor and popover
 * closes it. Null until the portal root and the first placement exist.
 */
export function usePopoverPlacement({
  anchor,
  side,
  rules,
  slot,
  onClose,
}: PopoverPlacementInput): PlacedPopover | null {
  const root = useEpisodePortalRoot();
  const [placement, setPlacement] = useState<PopoverPlacement | null>(null);
  const { maxWidth, gap, minRoom } = rules;
  useLayoutEffect(() => {
    const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });
    const place = () =>
      setPlacement(
        placePopover({
          anchor: anchor.getBoundingClientRect(),
          viewport: viewport(),
          side,
          maxWidth,
          gap,
          minRoom,
        }),
      );
    place();
    return follow({ anchor, slot, onClose }, place);
  }, [anchor, side, maxWidth, gap, minRoom, slot, onClose]);
  if (root === null || placement === null) return null;
  return { root, placement };
}
