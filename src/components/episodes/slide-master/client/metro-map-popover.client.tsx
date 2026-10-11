'use client';

import { useEpisodePortalRoot } from '@/hooks/use-episode-portal-root';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { laneStyle } from './metro-map-lines.client';
import type { StationCopy } from './metro-map-station.client';
import { placePopover, type Lane, type PopoverPlacement } from './metro-map.pure';

/** Keeps the popover beside its station while the page scrolls or resizes; Esc or a press elsewhere closes it. */
function usePlacement(anchor: HTMLElement, onClose: () => void): PopoverPlacement | null {
  const [placement, setPlacement] = useState<PopoverPlacement | null>(null);
  useLayoutEffect(() => {
    const place = () =>
      setPlacement(
        placePopover(anchor.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight }),
      );
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    const onPress = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !anchor.contains(target) && !target.closest('[data-slot="metro-popover"]'))
        onClose();
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

/** The lanes stopping here, as coloured ticks with their names: the popover says which lines change here. */
function LaneTicks({ lanes, names }: { lanes: readonly Lane[]; names: Record<Lane, string> }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
      {lanes.map((lane) => (
        <li key={lane} style={laneStyle(lane)} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-1.5 w-4 rounded-full bg-(--lane-light) dark:bg-(--lane-dark)" />
          {names[lane]}
        </li>
      ))}
    </ul>
  );
}

interface PopoverProps {
  id: string;
  anchor: HTMLElement;
  copy: StationCopy;
  lanes: readonly Lane[];
  laneNames: Record<Lane, string>;
  onClose: () => void;
}

/** A station's date, title and caption, portaled into the Episode portal root (FE-009 §8) so the chrome never covers it. */
export function MetroPopover({ id, anchor, copy, lanes, laneNames, onClose }: PopoverProps) {
  const root = useEpisodePortalRoot();
  const placement = usePlacement(anchor, onClose);
  if (root === null || placement === null) return null;
  const { side, left, width } = placement;
  const vertical = placement.side === 'below' ? { top: placement.top } : { bottom: placement.bottom };
  return createPortal(
    <div
      id={id}
      role="dialog"
      aria-label={copy.title}
      data-slot="metro-popover"
      data-side={side}
      style={{ ...vertical, left, width }}
      className="pointer-events-auto fixed rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xl"
    >
      <p className="font-mono text-xs tracking-widest text-muted-foreground tabular-nums">{copy.date}</p>
      <p className="mt-1 font-semibold">{copy.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.caption}</p>
      <LaneTicks lanes={lanes} names={laneNames} />
    </div>,
    root,
  );
}
