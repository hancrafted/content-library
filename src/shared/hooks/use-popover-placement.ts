import { useEpisodePortalRoot } from '@/shared/hooks/use-episode-portal-root';
import {
  placePopover,
  type PopoverPlacement,
  type PopoverRules,
  type PopoverSide,
} from '@/shared/lib/popover-placement.pure';
import { useLayoutEffect, useState } from 'react';

export interface PopoverPlacementInput {
  anchor: HTMLElement;
  side: PopoverSide;
  rules: PopoverRules;
  slot: string;
  onClose: () => void;
}

export interface PlacedPopover {
  // decision: FE-009 §8
  root: HTMLElement;
  placement: PopoverPlacement;
}

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
