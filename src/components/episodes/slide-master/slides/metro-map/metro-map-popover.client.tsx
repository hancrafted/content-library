'use client';

import { usePopoverPlacement } from '@/hooks/use-popover-placement';
import { createPortal } from 'react-dom';
import { laneStyle } from './metro-map-lines.client';
import type { StationCopy } from './metro-map-station.client';
import { POPOVER_RULES, type Lane } from './metro-map.pure';

const SLOT = 'metro-popover';

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
  const placed = usePopoverPlacement({ anchor, side: 'below', rules: POPOVER_RULES, slot: SLOT, onClose });
  if (placed === null) return null;
  const { root, placement } = placed;
  const { side, left, width } = placement;
  const vertical = placement.side === 'below' ? { top: placement.top } : { bottom: placement.bottom };
  return createPortal(
    <div
      id={id}
      role="dialog"
      aria-label={copy.title}
      data-slot={SLOT}
      data-side={side}
      style={{ ...vertical, left, width }}
      className="pointer-events-auto fixed rounded-xl border border-border bg-background p-4 text-foreground shadow-xl"
    >
      <p className="font-mono text-xs tracking-widest text-muted-foreground tabular-nums">{copy.date}</p>
      <p className="mt-1 font-semibold">{copy.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.caption}</p>
      <LaneTicks lanes={lanes} names={laneNames} />
    </div>,
    root,
  );
}
